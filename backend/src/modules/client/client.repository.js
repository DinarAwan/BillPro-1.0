const prisma = require('../../config/database');

class ClientRepository {
    async findByOrgId(orgId, { page = 1, limit = 20, search = '' }) {
        const skip = (page - 1) * limit;
        const where = {
            organizationId: orgId,
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { invoices: true } },
                },
            }),
            prisma.client.count({ where }),
        ]);

        return { clients, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findById(id) {
        return prisma.client.findUnique({
            where: { id },
            include: {
                invoices: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                _count: { select: { invoices: true } },
            },
        });
    }

    async create(data) {
        return prisma.client.create({ data });
    }

    async update(id, data) {
        return prisma.client.update({ where: { id }, data });
    }

    async delete(id) {
        return prisma.client.delete({ where: { id } });
    }
}

module.exports = new ClientRepository();
