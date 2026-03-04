const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('./auth.controller');
const authenticate = require('../../shared/middleware/auth');

const router = Router();

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Please provide a valid email.'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters.'),
        body('fullName').notEmpty().withMessage('Full name is required.'),
    ],
    authController.register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    authController.login
);

router.get('/me', authenticate, authController.getProfile);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
