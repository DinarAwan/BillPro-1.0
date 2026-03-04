const { Router } = require('express');
const { body } = require('express-validator');
const invoiceController = require('./invoice.controller');
const authenticate = require('../../shared/middleware/auth');
const roleGuard = require('../../shared/middleware/roleGuard');
const usageLimit = require('../../shared/middleware/usageLimit');

const router = Router({ mergeParams: true });

router.use(authenticate);

// Dashboard stats
router.get('/dashboard', roleGuard(), invoiceController.getDashboard);

// Invoice CRUD
router.get('/', roleGuard(), invoiceController.getAll);
router.get('/:id', roleGuard(), invoiceController.getById);

router.post(
    '/',
    roleGuard('OWNER', 'ADMIN', 'STAFF'),
    usageLimit,
    [
        body('clientId').notEmpty().withMessage('Client ID is required.'),
        body('issueDate').isISO8601().withMessage('Valid issue date is required.'),
        body('dueDate').isISO8601().withMessage('Valid due date is required.'),
        body('items').isArray({ min: 1 }).withMessage('At least one item is required.'),
        body('items.*.description').notEmpty().withMessage('Item description is required.'),
        body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
        body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be positive.'),
    ],
    invoiceController.create
);

router.put(
    '/:id',
    roleGuard('OWNER', 'ADMIN'),
    invoiceController.update
);

router.patch(
    '/:id/status',
    roleGuard('OWNER', 'ADMIN'),
    [
        body('status')
            .isIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELED'])
            .withMessage('Invalid status.'),
    ],
    invoiceController.updateStatus
);

router.delete('/:id', roleGuard('OWNER', 'ADMIN'), invoiceController.delete);

module.exports = router;
