const clientRepository = require('./client.repository');
const AppError = require('../../shared/utils/AppError');

class ClientService {
    async getClients(orgId, query) {
        return clientRepository.findByOrgId(orgId, query);
    }

    async getClientById(id, orgId) {
        const client = await clientRepository.findById(id);
        if (!client || client.organizationId !== orgId) {
            throw new AppError('Client not found.', 404);
        }
        return client;
    }

    async createClient(orgId, data) {
        return clientRepository.create({
            ...data,
            organizationId: orgId,
        });
    }

    async updateClient(id, orgId, data) {
        const client = await clientRepository.findById(id);
        if (!client || client.organizationId !== orgId) {
            throw new AppError('Client not found.', 404);
        }
        return clientRepository.update(id, data);
    }

    async deleteClient(id, orgId) {
        const client = await clientRepository.findById(id);
        if (!client || client.organizationId !== orgId) {
            throw new AppError('Client not found.', 404);
        }
        return clientRepository.delete(id);
    }
}

module.exports = new ClientService();
