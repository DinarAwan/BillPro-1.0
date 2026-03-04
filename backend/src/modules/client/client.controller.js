const clientService = require('./client.service');
const { sendSuccess, sendPaginated } = require('../../shared/utils/response');

class ClientController {
    async getAll(req, res, next) {
        try {
            const { page, limit, search } = req.query;
            const result = await clientService.getClients(req.params.orgId, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search: search || '',
            });
            sendPaginated(res, result.clients, {
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
            const client = await clientService.getClientById(req.params.id, req.params.orgId);
            sendSuccess(res, { client });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const client = await clientService.createClient(req.params.orgId, req.body);
            sendSuccess(res, { client }, 'Client created.', 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const client = await clientService.updateClient(req.params.id, req.params.orgId, req.body);
            sendSuccess(res, { client }, 'Client updated.');
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await clientService.deleteClient(req.params.id, req.params.orgId);
            sendSuccess(res, null, 'Client deleted.');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ClientController();
