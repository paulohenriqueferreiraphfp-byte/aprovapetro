import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.topic.findMany().then(console.log).finally(() => prisma.$disconnect());
