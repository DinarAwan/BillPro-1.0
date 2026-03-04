const subscriptionService = require('./subscription.service');
const { sendSuccess } = require('../../shared/utils/response');

class SubscriptionController {
    async get(req, res, next) {
        try {
            const subscription = await subscriptionService.getSubscription(req.params.orgId);
            sendSuccess(res, { subscription });
        } catch (error) {
            next(error);
        }
    }

    async upgrade(req, res, next) {
        try {
            const { plan } = req.body;
            const subscription = await subscriptionService.upgradePlan(
                req.params.orgId,
                plan,
                req.membership
            );
            sendSuccess(res, { subscription }, `Plan changed to ${plan}.`);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SubscriptionController();
