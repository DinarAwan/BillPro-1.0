const { Router } = require('express');
const { body } = require('express-validator');
const organizationController = require('./organization.controller');
const authenticate = require('../../shared/middleware/auth');
const roleGuard = require('../../shared/middleware/roleGuard');

const router = Router();

// All routes require authentication
router.use(authenticate);

// Organization CRUD
router.get('/', organizationController.getAll);

router.post(
    '/',
    [body('name').notEmpty().withMessage('Organization name is required.')],
    organizationController.create
);

router.get('/:orgId', roleGuard(), organizationController.getById);

router.put(
    '/:orgId',
    roleGuard('OWNER', 'ADMIN'),
    [body('name').optional().notEmpty().withMessage('Name cannot be empty.')],
    organizationController.update
);

router.delete('/:orgId', roleGuard('OWNER'), organizationController.delete);

// Members
router.get('/:orgId/members', roleGuard(), organizationController.getMembers);

router.post(
    '/:orgId/members',
    roleGuard('OWNER', 'ADMIN'),
    [
        body('email').isEmail().withMessage('Valid email is required.'),
        body('role').isIn(['ADMIN', 'STAFF']).withMessage('Role must be ADMIN or STAFF.'),
    ],
    organizationController.addMember
);

router.put(
    '/:orgId/members/:userId',
    roleGuard('OWNER'),
    [body('role').isIn(['ADMIN', 'STAFF']).withMessage('Role must be ADMIN or STAFF.')],
    organizationController.updateMemberRole
);

router.delete(
    '/:orgId/members/:userId',
    roleGuard('OWNER', 'ADMIN'),
    organizationController.removeMember
);

module.exports = router;
