const authService = require('./auth.service');
const { sendSuccess } = require('../../shared/utils/response');

class AuthController {
    async register(req, res, next) {
        try {
            const { email, password, fullName } = req.body;
            const result = await authService.register({ email, password, fullName });

            // Set cookie
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            sendSuccess(res, result, 'Registration successful.', 201);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login({ email, password });

            // Set cookie
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            sendSuccess(res, result, 'Login successful.');
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const user = await authService.getProfile(req.user.id);
            sendSuccess(res, { user });
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            res.clearCookie('token');
            sendSuccess(res, null, 'Logged out successfully.');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
