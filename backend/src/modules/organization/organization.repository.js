const prisma = require('../../config/database');

class OrganizationRepository {
    async findById(id) {
        return prisma.organization.findUnique({
            where: { id },
            include: {
                owner: { select: { id: true, email: true, fullName: true } },
                subscription: true,
                _count: { select: { members: true, invoices: true, clients: true } },
            },
        });
    }

    async findByUserId(userId) {
        const memberships = await prisma.organizationMember.findMany({
            where: { userId },
            include: {
                organization: {
                    include: {
                        subscription: true,
                        _count: { select: { members: true, invoices: true } },
                    },
                },
            },
        });
        return memberships.map((m) => ({ ...m.organization, role: m.role }));
    }

    async create(data) {
        return prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({ data });

            await tx.organizationMember.create({
                data: {
                    organizationId: org.id,
                    userId: data.ownerId,
                    role: 'OWNER',
                },
            });

            // Create free subscription
            const now = new Date();
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 100);

            await tx.subscription.create({
                data: {
                    organizationId: org.id,
                    plan: 'FREE',
                    invoiceLimit: 20,
                    userLimit: 1,
                    startsAt: now,
                    expiresAt,
                    status: 'ACTIVE',
                },
            });

            return org;
        });
    }

    async update(id, data) {
        return prisma.organization.update({ where: { id }, data });
    }

    async delete(id) {
        return prisma.organization.delete({ where: { id } });
    }

    async getMembers(orgId) {
        return prisma.organizationMember.findMany({
            where: { organizationId: orgId },
            include: {
                user: { select: { id: true, email: true, fullName: true } },
            },
        });
    }

    async addMember(orgId, userId, role) {
        return prisma.organizationMember.create({
            data: { organizationId: orgId, userId, role },
        });
    }

    async updateMemberRole(orgId, userId, role) {
        return prisma.organizationMember.update({
            where: { organizationId_userId: { organizationId: orgId, userId } },
            data: { role },
        });
    }

    async removeMember(orgId, userId) {
        return prisma.organizationMember.delete({
            where: { organizationId_userId: { organizationId: orgId, userId } },
        });
    }

    async findMember(orgId, userId) {
        return prisma.organizationMember.findUnique({
            where: { organizationId_userId: { organizationId: orgId, userId } },
        });
    }
}

module.exports = new OrganizationRepository();
