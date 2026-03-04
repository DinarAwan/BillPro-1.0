const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const AppError = require('../../shared/utils/AppError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env');

class AuthService {
    generateToken(userId) {
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }

    async register({ email, password, fullName }) {
        // Check if user already exists
        const existingUser = await authRepository.findUserByEmail(email);
        if (existingUser) {
            throw new AppError('Email already registered.', 409);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user + default org + free subscription (transactional)
        const { user, organization } = await authRepository.createUserWithOrganization(
            {
                email,
                password: hashedPassword,
                fullName,
            },
            `${fullName}'s Organization`
        );

        const token = this.generateToken(user.id);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
            organization: {
                id: organization.id,
                name: organization.name,
            },
        };
    }

    async login({ email, password }) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password.', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password.', 401);
        }

        const token = this.generateToken(user.id);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
            },
        };
    }

    async getProfile(userId) {
        const user = await authRepository.findUserById(userId);
        if (!user) {
            throw new AppError('User not found.', 404);
        }
        return user;
    }
}

module.exports = new AuthService();
