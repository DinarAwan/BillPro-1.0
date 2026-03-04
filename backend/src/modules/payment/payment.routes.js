const { Router } = require('express');
const { body } = require('express-validator');
const paymentController = require('./payment.controller');
const authenticate = require('../../shared/middleware/auth');
const roleGuard = require('../../shared/middleware/roleGuard');

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(
    '/:invoiceId/payments',
    roleGuard(),
    paymentController.getAll
);

router.post(
    '/:invoiceId/payments',
    roleGuard('OWNER', 'ADMIN'),
    [
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive.'),
        body('paymentDate').isISO8601().withMessage('Valid payment date is required.'),
        body('method').isIn(['CASH', 'TRANSFER', 'EWALLET']).withMessage('Invalid payment method.'),
    ],
    paymentController.create
);

router.delete(
    '/:invoiceId/payments/:paymentId',
    roleGuard('OWNER', 'ADMIN'),
    paymentController.delete
);

module.exports = router;
