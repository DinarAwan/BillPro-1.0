const AppError = require('../utils/AppError');
const prisma = require('../../config/database');

/**
 * Middleware to check organization membership and role.
 * Reads orgId from req.params.orgId.
 * Sets req.organization and req.membership on success.
 * 
 * @param  {...string} allowedRoles - Roles allowed (e.g. 'OWNER', 'ADMIN', 'STAFF')
 */
const roleGuard = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            const orgId = req.params.orgId;

            if (!orgId) {
                throw new AppError('Organization ID is required.', 400);
            }

            const organization = await prisma.organization.findUnique({
                where: { id: orgId },
            });

            if (!organization) {
                throw new AppError('Organization not found.', 404);
            }

            const membership = await prisma.organizationMember.findUnique({
                where: {
                    organizationId_userId: {
                        organizationId: orgId,
                        userId: req.user.id,
                    },
                },
            });

            if (!membership) {
                throw new AppError('You are not a member of this organization.', 403);
            }

            if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
                throw new AppError('You do not have permission to perform this action.', 403);
            }

            req.organization = organization;
            req.membership = membership;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = roleGuard;
