const organizationRepository = require('./organization.repository');
const AppError = require('../../shared/utils/AppError');
const prisma = require('../../config/database');

class OrganizationService {
    async getUserOrganizations(userId) {
        return organizationRepository.findByUserId(userId);
    }

    async getOrganizationById(orgId) {
        const org = await organizationRepository.findById(orgId);
        if (!org) throw new AppError('Organization not found.', 404);
        return org;
    }

    async createOrganization(userId, data) {
        return organizationRepository.create({
            ...data,
            ownerId: userId,
        });
    }

    async updateOrganization(orgId, data, membership) {
        if (membership.role === 'STAFF') {
            throw new AppError('Staff members cannot update organization settings.', 403);
        }
        return organizationRepository.update(orgId, data);
    }

    async deleteOrganization(orgId, membership) {
        if (membership.role !== 'OWNER') {
            throw new AppError('Only the owner can delete the organization.', 403);
        }
        return organizationRepository.delete(orgId);
    }

    async getMembers(orgId) {
        return organizationRepository.getMembers(orgId);
    }

    async addMember(orgId, email, role, membership) {
        if (membership.role === 'STAFF') {
            throw new AppError('Staff members cannot add new members.', 403);
        }

        // Check subscription user limit
        const subscription = await prisma.subscription.findUnique({
            where: { organizationId: orgId },
        });

        if (subscription && subscription.userLimit !== -1) {
            const currentMembers = await prisma.organizationMember.count({
                where: { organizationId: orgId },
            });
            if (currentMembers >= subscription.userLimit) {
                throw new AppError(
                    `User limit reached (${subscription.userLimit}). Please upgrade your plan.`,
                    403
                );
            }
        }

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError('User not found with this email.', 404);

        // Check if already member
        const existing = await organizationRepository.findMember(orgId, user.id);
        if (existing) throw new AppError('User is already a member.', 409);

        return organizationRepository.addMember(orgId, user.id, role);
    }

    async updateMemberRole(orgId, userId, role, membership) {
        if (membership.role !== 'OWNER') {
            throw new AppError('Only owner can change member roles.', 403);
        }

        const target = await organizationRepository.findMember(orgId, userId);
        if (!target) throw new AppError('Member not found.', 404);

        if (target.role === 'OWNER') {
            throw new AppError('Cannot change owner role.', 400);
        }

        return organizationRepository.updateMemberRole(orgId, userId, role);
    }

    async removeMember(orgId, userId, membership) {
        if (membership.role === 'STAFF') {
            throw new AppError('Staff members cannot remove members.', 403);
        }

        const target = await organizationRepository.findMember(orgId, userId);
        if (!target) throw new AppError('Member not found.', 404);

        if (target.role === 'OWNER') {
            throw new AppError('Cannot remove the organization owner.', 400);
        }

        return organizationRepository.removeMember(orgId, userId);
    }
}

module.exports = new OrganizationService();
