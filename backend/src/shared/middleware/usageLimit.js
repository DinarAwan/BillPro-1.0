const AppError = require('../utils/AppError');
const prisma = require('../../config/database');

/**
 * Middleware to enforce subscription usage limits.
 * Must be used AFTER roleGuard (needs req.organization).
 */
const usageLimit = async (req, res, next) => {
    try {
        const orgId = req.organization.id;

        const subscription = await prisma.subscription.findUnique({
            where: { organizationId: orgId },
        });

        if (!subscription) {
            throw new AppError('No active subscription found.', 403);
        }

        if (subscription.status !== 'ACTIVE') {
            throw new AppError('Subscription is not active.', 403);
        }

        if (new Date() > new Date(subscription.expiresAt)) {
            // Auto-expire subscription
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: 'EXPIRED' },
            });
            throw new AppError('Subscription has expired. Please renew.', 403);
        }

        // Check invoice limit (only for invoice creation)
        if (subscription.invoiceLimit !== -1) {
            const currentMonth = new Date();
            const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
            const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);

            const invoiceCount = await prisma.invoice.count({
                where: {
                    organizationId: orgId,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                    deletedAt: null,
                },
            });

            if (invoiceCount >= subscription.invoiceLimit) {
                throw new AppError(
                    `Invoice limit reached (${subscription.invoiceLimit}/month). Please upgrade your plan.`,
                    403
                );
            }
        }

        req.subscription = subscription;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = usageLimit;
