const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://root:root123@localhost:5432/root';

const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
