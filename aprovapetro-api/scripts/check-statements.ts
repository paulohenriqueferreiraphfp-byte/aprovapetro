import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({ take: 5, include: { options: true } });
  for (const q of qs) {
    console.log(`Q ID: ${q.id}, Bank: ${q.bank}`);
    console.log(`Statement length: ${q.statement.length}`);
    console.log(`Statement text: ${q.statement}`);
    console.log(`Options count: ${q.options.length}`);
    console.log('---');
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
