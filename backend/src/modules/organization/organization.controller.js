const organizationService = require('./organization.service');
const { sendSuccess } = require('../../shared/utils/response');

class OrganizationController {
    async getAll(req, res, next) {
        try {
            const orgs = await organizationService.getUserOrganizations(req.user.id);
            sendSuccess(res, { organizations: orgs });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const org = await organizationService.getOrganizationById(req.params.orgId);
            sendSuccess(res, { organization: org });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const org = await organizationService.createOrganization(req.user.id, req.body);
            sendSuccess(res, { organization: org }, 'Organization created.', 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const org = await organizationService.updateOrganization(
                req.params.orgId,
                req.body,
                req.membership
            );
            sendSuccess(res, { organization: org }, 'Organization updated.');
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await organizationService.deleteOrganization(req.params.orgId, req.membership);
            sendSuccess(res, null, 'Organization deleted.');
        } catch (error) {
            next(error);
        }
    }

    async getMembers(req, res, next) {
        try {
            const members = await organizationService.getMembers(req.params.orgId);
            sendSuccess(res, { members });
        } catch (error) {
            next(error);
        }
    }

    async addMember(req, res, next) {
        try {
            const { email, role } = req.body;
            const member = await organizationService.addMember(
                req.params.orgId,
                email,
                role,
                req.membership
            );
            sendSuccess(res, { member }, 'Member added.', 201);
        } catch (error) {
            next(error);
        }
    }

    async updateMemberRole(req, res, next) {
        try {
            const { role } = req.body;
            const member = await organizationService.updateMemberRole(
                req.params.orgId,
                req.params.userId,
                role,
                req.membership
            );
            sendSuccess(res, { member }, 'Member role updated.');
        } catch (error) {
            next(error);
        }
    }

    async removeMember(req, res, next) {
        try {
            await organizationService.removeMember(
                req.params.orgId,
                req.params.userId,
                req.membership
            );
            sendSuccess(res, null, 'Member removed.');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new OrganizationController();
