const { Router } = require('express');
const { body } = require('express-validator');
const subscriptionController = require('./subscription.controller');
const authenticate = require('../../shared/middleware/auth');
const roleGuard = require('../../shared/middleware/roleGuard');

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', roleGuard(), subscriptionController.get);

router.put(
    '/',
    roleGuard('OWNER'),
    [
        body('plan')
            .isIn(['FREE', 'PRO', 'BUSINESS'])
            .withMessage('Plan must be FREE, PRO, or BUSINESS.'),
    ],
    subscriptionController.upgrade
);

module.exports = router;
