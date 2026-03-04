const invoiceRepository = require('./invoice.repository');
const AppError = require('../../shared/utils/AppError');

class InvoiceService {
    async getInvoices(orgId, query) {
        return invoiceRepository.findByOrgId(orgId, query);
    }

    async getInvoiceById(id, orgId) {
        const invoice = await invoiceRepository.findById(id);
        if (!invoice || invoice.organizationId !== orgId || invoice.deletedAt) {
            throw new AppError('Invoice not found.', 404);
        }
        return invoice;
    }

    async createInvoice(orgId, data, userId) {
        const { items, ...invoiceData } = data;

        if (!items || items.length === 0) {
            throw new AppError('Invoice must have at least one item.', 400);
        }

        return invoiceRepository.createWithItems(
            {
                ...invoiceData,
                organizationId: orgId,
            },
            items,
            userId
        );
    }

    async updateInvoice(id, orgId, data, userId) {
        const invoice = await invoiceRepository.findById(id);
        if (!invoice || invoice.organizationId !== orgId || invoice.deletedAt) {
            throw new AppError('Invoice not found.', 404);
        }

        if (invoice.status === 'PAID') {
            throw new AppError('Cannot edit a paid invoice.', 400);
        }

        if (invoice.status === 'CANCELED') {
            throw new AppError('Cannot edit a canceled invoice.', 400);
        }

        const { items, ...invoiceData } = data;

        if (items) {
            return invoiceRepository.updateWithItems(id, invoiceData, items, userId);
        }

        return invoiceRepository.update(id, invoiceData);
    }

    async updateStatus(id, orgId, status, userId) {
        const invoice = await invoiceRepository.findById(id);
        if (!invoice || invoice.organizationId !== orgId || invoice.deletedAt) {
            throw new AppError('Invoice not found.', 404);
        }

        // Validate status transitions
        const validTransitions = {
            DRAFT: ['SENT', 'CANCELED'],
            SENT: ['PAID', 'OVERDUE', 'CANCELED'],
            OVERDUE: ['PAID', 'CANCELED'],
            PAID: [],          // Final state
            CANCELED: ['DRAFT'], // Can re-open as draft
        };

        const allowed = validTransitions[invoice.status] || [];
        if (!allowed.includes(status)) {
            throw new AppError(
                `Cannot change status from ${invoice.status} to ${status}.`,
                400
            );
        }

        return invoiceRepository.updateStatus(id, status, userId);
    }

    async deleteInvoice(id, orgId, userId) {
        const invoice = await invoiceRepository.findById(id);
        if (!invoice || invoice.organizationId !== orgId || invoice.deletedAt) {
            throw new AppError('Invoice not found.', 404);
        }

        return invoiceRepository.softDelete(id, userId);
    }

    async getDashboardStats(orgId) {
        return invoiceRepository.getDashboardStats(orgId);
    }

    // Cron job: mark overdue invoices
    async processOverdueInvoices() {
        const overdueInvoices = await invoiceRepository.findOverdueInvoices();

        if (overdueInvoices.length > 0) {
            const ids = overdueInvoices.map((inv) => inv.id);
            await invoiceRepository.bulkUpdateStatus(ids, 'OVERDUE');
            console.log(`[CRON] Marked ${ids.length} invoices as OVERDUE`);
        }

        return overdueInvoices.length;
    }
}

module.exports = new InvoiceService();
