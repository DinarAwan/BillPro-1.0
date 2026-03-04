const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');
const AppError = require('../utils/AppError');
const prisma = require('../../config/database');

const authenticate = async (req, res, next) => {
    try {
        let token;

        // Check Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            throw new AppError('Not authenticated. Please login.', 401);
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                fullName: true,
                isVerified: true,
            },
        });

        if (!user) {
            throw new AppError('User no longer exists.', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token.', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expired. Please login again.', 401));
        }
        next(error);
    }
};

module.exports = authenticate;
