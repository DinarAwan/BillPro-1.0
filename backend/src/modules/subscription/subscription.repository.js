const prisma = require('../../config/database');

class SubscriptionRepository {
    async findByOrgId(orgId) {
        return prisma.subscription.findUnique({
            where: { organizationId: orgId },
        });
    }

    async create(data) {
        return prisma.subscription.create({ data });
    }

    async update(orgId, data) {
        return prisma.subscription.update({
            where: { organizationId: orgId },
            data,
        });
    }

    async getUsageStats(orgId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const [invoiceCount, memberCount, apiCallCount] = await Promise.all([
            prisma.invoice.count({
                where: {
                    organizationId: orgId,
                    createdAt: { gte: startOfMonth, lte: endOfMonth },
                    deletedAt: null,
                },
            }),
            prisma.organizationMember.count({
                where: { organizationId: orgId },
            }),
            prisma.usageLog.count({
                where: {
                    organizationId: orgId,
                    actionType: 'API_CALL',
                    createdAt: { gte: startOfMonth, lte: endOfMonth },
                },
            }),
        ]);

        return { invoiceCount, memberCount, apiCallCount };
    }
}

module.exports = new SubscriptionRepository();
