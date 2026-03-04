const paymentRepository = require('./payment.repository');
const AppError = require('../../shared/utils/AppError');
const prisma = require('../../config/database');

class PaymentService {
    async getPayments(invoiceId, orgId) {
        // Verify invoice belongs to org
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (!invoice || invoice.organizationId !== orgId) {
            throw new AppError('Invoice not found.', 404);
        }
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    async createPayment(invoiceId, orgId, data, userId) {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true },
        });

        if (!invoice || invoice.organizationId !== orgId) {
            throw new AppError('Invoice not found.', 404);
        }

        if (invoice.status === 'DRAFT') {
            throw new AppError('Cannot add payment to a draft invoice. Send it first.', 400);
        }

        if (invoice.status === 'CANCELED') {
            throw new AppError('Cannot add payment to a canceled invoice.', 400);
        }

        if (invoice.status === 'PAID') {
            throw new AppError('Invoice is already fully paid.', 400);
        }

        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = invoice.total - totalPaid;

        if (data.amount > remaining) {
            throw new AppError(
                `Payment amount (${data.amount}) exceeds remaining balance (${remaining}).`,
                400
            );
        }

        return paymentRepository.create(
            {
                invoiceId,
                amount: data.amount,
                paymentDate: new Date(data.paymentDate),
                method: data.method,
                referenceNumber: data.referenceNumber || null,
            },
            userId
        );
    }

    async deletePayment(paymentId, orgId, userId) {
        const payment = await paymentRepository.findById(paymentId);
        if (!payment) throw new AppError('Payment not found.', 404);

        const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId } });
        if (!invoice || invoice.organizationId !== orgId) {
            throw new AppError('Payment not found.', 404);
        }

        return paymentRepository.delete(paymentId);
    }
}

module.exports = new PaymentService();
