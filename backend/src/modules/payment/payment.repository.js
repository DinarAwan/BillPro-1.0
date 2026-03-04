const prisma = require('../../config/database');

class PaymentRepository {
    async findByInvoiceId(invoiceId) {
        return prisma.payment.findMany({
            where: { invoiceId },
            orderBy: { paymentDate: 'desc' },
        });
    }

    async findById(id) {
        return prisma.payment.findUnique({ where: { id } });
    }

    async create(data, userId) {
        return prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({ data });

            // Check if invoice is fully paid
            const invoice = await tx.invoice.findUnique({
                where: { id: data.invoiceId },
                include: { payments: true },
            });

            const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + data.amount;

            if (totalPaid >= invoice.total) {
                await tx.invoice.update({
                    where: { id: data.invoiceId },
                    data: { status: 'PAID' },
                });

                await tx.invoiceLog.create({
                    data: {
                        invoiceId: data.invoiceId,
                        action: 'paid',
                        description: `Invoice fully paid. Total: ${totalPaid}`,
                        createdById: userId,
                    },
                });
            }

            await tx.invoiceLog.create({
                data: {
                    invoiceId: data.invoiceId,
                    action: 'payment_received',
                    description: `Payment of ${data.amount} received via ${data.method}`,
                    createdById: userId,
                },
            });

            return payment;
        });
    }

    async delete(id) {
        return prisma.payment.delete({ where: { id } });
    }
}

module.exports = new PaymentRepository();
