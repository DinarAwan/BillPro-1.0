const prisma = require('../../config/database');

class AuthRepository {
    async findUserByEmail(email) {
        return prisma.user.findUnique({ where: { email } });
    }

    async findUserById(id) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                isVerified: true,
                createdAt: true,
                memberships: {
                    include: {
                        organization: {
                            select: { id: true, name: true, logoUrl: true },
                        },
                    },
                },
            },
        });
    }

    async createUser(data) {
        return prisma.user.create({ data });
    }

    async createUserWithOrganization(userData, orgName) {
        return prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({ data: userData });

            // Create default organization
            const organization = await tx.organization.create({
                data: {
                    name: orgName,
                    ownerId: user.id,
                },
            });

            // Add user as OWNER member
            await tx.organizationMember.create({
                data: {
                    organizationId: organization.id,
                    userId: user.id,
                    role: 'OWNER',
                },
            });

            // Create FREE subscription
            const now = new Date();
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 100); // Free plan doesn't expire

            await tx.subscription.create({
                data: {
                    organizationId: organization.id,
                    plan: 'FREE',
                    invoiceLimit: 20,
                    userLimit: 1,
                    startsAt: now,
                    expiresAt: expiresAt,
                    status: 'ACTIVE',
                },
            });

            return { user, organization };
        });
    }

    async updateUser(id, data) {
        return prisma.user.update({ where: { id }, data });
    }
}

module.exports = new AuthRepository();
