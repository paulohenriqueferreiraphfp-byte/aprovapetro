import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({ 
    where: { topic: { name: 'Mecânica dos Fluidos' } },
    include: { options: true } 
  });
  console.log(`Encontradas ${qs.length} questões de fluidos.`);
  for (const q of qs) {
    console.log(`Q ID: ${q.id}`);
    console.log(`Statement: "${q.statement}"`);
    console.log(`Options: ${q.options.map(o => o.text).join(' | ')}`);
    console.log('---');
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
