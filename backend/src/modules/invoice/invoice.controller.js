const invoiceService = require('./invoice.service');
const { sendSuccess, sendPaginated } = require('../../shared/utils/response');

class InvoiceController {
    async getAll(req, res, next) {
        try {
            const { page, limit, status, search } = req.query;
            const result = await invoiceService.getInvoices(req.params.orgId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                status: status || undefined,
                search: search || '',
            });
            sendPaginated(res, result.invoices, {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const invoice = await invoiceService.getInvoiceById(req.params.id, req.params.orgId);
            sendSuccess(res, { invoice });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const invoice = await invoiceService.createInvoice(
                req.params.orgId,
                req.body,
                req.user.id
            );
            sendSuccess(res, { invoice }, 'Invoice created.', 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const invoice = await invoiceService.updateInvoice(
                req.params.id,
                req.params.orgId,
                req.body,
                req.user.id
            );
            sendSuccess(res, { invoice }, 'Invoice updated.');
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const { status } = req.body;
            const invoice = await invoiceService.updateStatus(
                req.params.id,
                req.params.orgId,
                status,
                req.user.id
            );
            sendSuccess(res, { invoice }, `Invoice status changed to ${status}.`);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await invoiceService.deleteInvoice(req.params.id, req.params.orgId, req.user.id);
            sendSuccess(res, null, 'Invoice deleted.');
        } catch (error) {
            next(error);
        }
    }

    async getDashboard(req, res, next) {
        try {
            const stats = await invoiceService.getDashboardStats(req.params.orgId);
            sendSuccess(res, { stats });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InvoiceController();
