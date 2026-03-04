const AppError = require('../utils/AppError');
const { NODE_ENV } = require('../../config/env');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.stack = err.stack;

    // Log in development
    if (NODE_ENV === 'development') {
        console.error('ERROR:', error.message);
        if (error.stack) console.error(error.stack);
    }

    // Prisma errors
    if (err.code === 'P2002') {
        const field = err.meta?.target?.join(', ') || 'field';
        error = new AppError(`Duplicate value for ${field}. This value already exists.`, 409);
    }

    if (err.code === 'P2025') {
        error = new AppError('Record not found.', 404);
    }

    if (err.code === 'P2003') {
        error = new AppError('Cannot delete or update. Related records exist.', 400);
    }

    // Validation errors (express-validator)
    if (err.array && typeof err.array === 'function') {
        const messages = err.array().map((e) => e.msg);
        error = new AppError('Validation failed.', 422, messages);
    }

    const statusCode = error.statusCode || 500;
    const message = error.isOperational ? error.message : 'Internal server error';

    res.status(statusCode).json({
        status: 'error',
        message,
        ...(error.errors && { errors: error.errors }),
        ...(NODE_ENV === 'development' && { stack: error.stack }),
    });
};

module.exports = errorHandler;
