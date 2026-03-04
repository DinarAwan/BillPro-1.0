const paymentService = require('./payment.service');
const { sendSuccess } = require('../../shared/utils/response');

class PaymentController {
    async getAll(req, res, next) {
        try {
            const payments = await paymentService.getPayments(req.params.invoiceId, req.params.orgId);
            sendSuccess(res, { payments });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const payment = await paymentService.createPayment(
                req.params.invoiceId,
                req.params.orgId,
                req.body,
                req.user.id
            );
            sendSuccess(res, { payment }, 'Payment recorded.', 201);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await paymentService.deletePayment(req.params.paymentId, req.params.orgId, req.user.id);
            sendSuccess(res, null, 'Payment deleted.');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentController();
