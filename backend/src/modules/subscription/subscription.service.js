const subscriptionRepository = require('./subscription.repository');
const AppError = require('../../shared/utils/AppError');
const { SUBSCRIPTION_LIMITS } = require('../../shared/constants');

class SubscriptionService {
    async getSubscription(orgId) {
        const subscription = await subscriptionRepository.findByOrgId(orgId);
        if (!subscription) {
            throw new AppError('No subscription found.', 404);
        }

        const usage = await subscriptionRepository.getUsageStats(orgId);

        return {
            ...subscription,
            usage,
        };
    }

    async upgradePlan(orgId, plan, membership) {
        if (membership.role !== 'OWNER') {
            throw new AppError('Only the owner can change the subscription plan.', 403);
        }

        const validPlans = ['FREE', 'PRO', 'BUSINESS'];
        if (!validPlans.includes(plan)) {
            throw new AppError('Invalid plan.', 400);
        }

        const limits = SUBSCRIPTION_LIMITS[plan];
        const now = new Date();
        const expiresAt = new Date();

        if (plan === 'FREE') {
            expiresAt.setFullYear(expiresAt.getFullYear() + 100);
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription
        }

        return subscriptionRepository.update(orgId, {
            plan,
            invoiceLimit: limits.invoiceLimit,
            userLimit: limits.userLimit,
            startsAt: now,
            expiresAt,
            status: 'ACTIVE',
        });
    }
}

module.exports = new SubscriptionService();
