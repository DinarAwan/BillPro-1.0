const { Router } = require('express');
const { body } = require('express-validator');
const clientController = require('./client.controller');
const authenticate = require('../../shared/middleware/auth');
const roleGuard = require('../../shared/middleware/roleGuard');

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', roleGuard(), clientController.getAll);
router.get('/:id', roleGuard(), clientController.getById);

router.post(
    '/',
    roleGuard('OWNER', 'ADMIN'),
    [
        body('name').notEmpty().withMessage('Client name is required.'),
        body('email').optional().isEmail().withMessage('Invalid email.'),
    ],
    clientController.create
);

router.put(
    '/:id',
    roleGuard('OWNER', 'ADMIN'),
    [body('name').optional().notEmpty().withMessage('Name cannot be empty.')],
    clientController.update
);

router.delete('/:id', roleGuard('OWNER', 'ADMIN'), clientController.delete);

module.exports = router;
