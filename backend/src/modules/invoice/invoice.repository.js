const prisma = require('../../config/database');

class InvoiceRepository {
    async findByOrgId(orgId, { page = 1, limit = 20, status, search = '' }) {
        const skip = (page - 1) * limit;
        const where = {
            organizationId: orgId,
            deletedAt: null,
            ...(status && { status }),
            ...(search && {
                OR: [
                    { invoiceNumber: { contains: search, mode: 'insensitive' } },
                    { client: { name: { contains: search, mode: 'insensitive' } } },
                ],
            }),
        };

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    client: { select: { id: true, name: true, email: true } },
                    createdBy: { select: { id: true, fullName: true } },
                    _count: { select: { items: true, payments: true } },
                },
            }),
            prisma.invoice.count({ where }),
        ]);

        return { invoices, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findById(id) {
        return prisma.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                items: true,
                payments: { orderBy: { paymentDate: 'desc' } },
                logs: {
                    orderBy: { createdAt: 'desc' },
                    include: { createdBy: { select: { id: true, fullName: true } } },
                },
                createdBy: { select: { id: true, fullName: true, email: true } },
            },
        });
    }

    /**
     * Generate next invoice number using transaction + SELECT FOR UPDATE
     * Format: INV-{YEAR}-{0001}
     */
    async generateInvoiceNumber(orgId, tx) {
        const year = new Date().getFullYear();

        // Upsert the counter — atomic operation
        const counter = await tx.invoiceCounter.upsert({
            where: {
                organizationId_year: { organizationId: orgId, year },
            },
            update: {
                currentNumber: { increment: 1 },
            },
            create: {
                organizationId: orgId,
                year,
                currentNumber: 1,
            },
        });

        const paddedNumber = String(counter.currentNumber).padStart(4, '0');
        return `INV-${year}-${paddedNumber}`;
    }

    async createWithItems(data, items, userId) {
        return prisma.$transaction(async (tx) => {
            // Generate invoice number (transaction-safe)
            const invoiceNumber = await this.generateInvoiceNumber(data.organizationId, tx);

            // Calculate totals
            let subtotal = 0;
            const processedItems = items.map((item) => {
                const total = item.quantity * item.unitPrice;
                subtotal += total;
                return { ...item, total };
            });

            const tax = data.tax || 0;
            const total = subtotal + (subtotal * tax) / 100;

            // Create invoice
            const invoice = await tx.invoice.create({
                data: {
                    ...data,
                    invoiceNumber,
                    subtotal,
                    tax,
                    total,
                    createdById: userId,
                    items: {
                        create: processedItems,
                    },
                },
                include: {
                    items: true,
                    client: true,
                },
            });

            // Create log entry
            await tx.invoiceLog.create({
                data: {
                    invoiceId: invoice.id,
                    action: 'created',
                    description: `Invoice ${invoiceNumber} created`,
                    createdById: userId,
                },
            });

            // Track usage
            await tx.usageLog.create({
                data: {
                    organizationId: data.organizationId,
                    actionType: 'INVOICE_CREATED',
                },
            });

            return invoice;
        });
    }

    async update(id, data) {
        return prisma.invoice.update({
            where: { id },
            data,
            include: { items: true, client: true },
        });
    }

    async updateWithItems(id, data, items, userId) {
        return prisma.$transaction(async (tx) => {
            // Delete old items
            await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

            // Calculate new totals
            let subtotal = 0;
            const processedItems = items.map((item) => {
                const total = item.quantity * item.unitPrice;
                subtotal += total;
                return { ...item, total };
            });

            const tax = data.tax || 0;
            const total = subtotal + (subtotal * tax) / 100;

            // Update invoice
            const invoice = await tx.invoice.update({
                where: { id },
                data: {
                    ...data,
                    subtotal,
                    tax,
                    total,
                    items: { create: processedItems },
                },
                include: { items: true, client: true },
            });

            // Log
            await tx.invoiceLog.create({
                data: {
                    invoiceId: id,
                    action: 'edited',
                    description: `Invoice updated`,
                    createdById: userId,
                },
            });

            return invoice;
        });
    }

    async updateStatus(id, status, userId) {
        return prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.update({
                where: { id },
                data: { status },
            });

            await tx.invoiceLog.create({
                data: {
                    invoiceId: id,
                    action: status.toLowerCase(),
                    description: `Status changed to ${status}`,
                    createdById: userId,
                },
            });

            return invoice;
        });
    }

    async softDelete(id, userId) {
        return prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            await tx.invoiceLog.create({
                data: {
                    invoiceId: id,
                    action: 'deleted',
                    description: 'Invoice soft deleted',
                    createdById: userId,
                },
            });

            return invoice;
        });
    }

    async findOverdueInvoices() {
        return prisma.invoice.findMany({
            where: {
                status: 'SENT',
                dueDate: { lt: new Date() },
                deletedAt: null,
            },
            include: {
                organization: true,
                client: true,
            },
        });
    }

    async bulkUpdateStatus(ids, status) {
        return prisma.invoice.updateMany({
            where: { id: { in: ids } },
            data: { status },
        });
    }

    async getDashboardStats(orgId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalInvoices, paidInvoices, overdueInvoices, draftInvoices, monthlyRevenue, totalRevenue] =
            await Promise.all([
                prisma.invoice.count({ where: { organizationId: orgId, deletedAt: null } }),
                prisma.invoice.count({ where: { organizationId: orgId, status: 'PAID', deletedAt: null } }),
                prisma.invoice.count({ where: { organizationId: orgId, status: 'OVERDUE', deletedAt: null } }),
                prisma.invoice.count({ where: { organizationId: orgId, status: 'DRAFT', deletedAt: null } }),
                prisma.invoice.aggregate({
                    where: {
                        organizationId: orgId,
                        status: 'PAID',
                        deletedAt: null,
                        updatedAt: { gte: startOfMonth },
                    },
                    _sum: { total: true },
                }),
                prisma.invoice.aggregate({
                    where: { organizationId: orgId, status: 'PAID', deletedAt: null },
                    _sum: { total: true },
                }),
            ]);

        return {
            totalInvoices,
            paidInvoices,
            overdueInvoices,
            draftInvoices,
            monthlyRevenue: monthlyRevenue._sum.total || 0,
            totalRevenue: totalRevenue._sum.total || 0,
        };
    }
}

module.exports = new InvoiceRepository();
