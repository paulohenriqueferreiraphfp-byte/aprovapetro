const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({
    include: { topic: { include: { subject: true } } }
  });
  console.log(qs.map(q => ({
    id: q.id,
    statement: q.statement,
    topic: q.topic?.name
  })));
}

main().finally(() => prisma.$disconnect());
