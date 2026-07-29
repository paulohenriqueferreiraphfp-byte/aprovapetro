import { PrismaClient, Cargo } from '@prisma/client';

const prisma = new PrismaClient();

async function runTests() {
  console.log('--- TESTE DE INTEGRIDADE DO APROVAPETRO ---');
  
  // 1. Check Cargos
  const cargos = await prisma.cargo.findMany();
  console.log(`\n✅ Cargos encontrados: ${cargos.length}`);
  const tecnicos = cargos.filter((c: Cargo) => c.level === 'TÉCNICO');
  const superiores = cargos.filter((c: Cargo) => c.level === 'SUPERIOR');
  console.log(`- Técnicos: ${tecnicos.length}`);
  console.log(`- Superiores: ${superiores.length}`);

  // 2. Check Subjects and Topics
  const subjects = await prisma.subject.findMany({ include: { topics: true } });
  console.log(`\n✅ Disciplinas cadastradas: ${subjects.length}`);
  let totalTopics = 0;
  for (const s of subjects) {
    console.log(`  - ${s.name} (Tópicos: ${s.topics.length})`);
    totalTopics += s.topics.length;
  }
  
  // 3. Check Questions
  const questions = await prisma.question.findMany();
  console.log(`\n✅ Banco de Questões: ${questions.length} cadastradas no total.`);

  // 4. Test Simulado Logic (Simulation of backend logic)
  console.log('\n--- TESTE DE LÓGICA DE SIMULADOS ---');
  // Check if we can build a simulado for Engenheiro Mecânico (Superior)
  const engMecanico = cargos.find((c: Cargo) => c.name === 'Engenheiro Mecânico');
  if (engMecanico) {
    const questionsEng = await prisma.question.findMany({
      where: {
        topic: {
          subject: {
            name: {
              in: ['Engenharia Específica', 'Língua Portuguesa', 'Matemática']
            }
          }
        }
      },
      take: 10,
    });
    console.log(`✅ Conseguiu buscar ${questionsEng.length} questões direcionadas para Nível Superior (Mecânica).`);
    if(questionsEng.length === 0) {
      console.log('❌ FALHA: Faltam questões de nível superior no banco! O scraper gerou questões?');
    }
  }

  // Check if we can build a simulado for Técnico de Operação
  const tecOp = cargos.find((c: Cargo) => c.name === 'Técnico de Operação');
  if (tecOp) {
    const questionsTec = await prisma.question.findMany({
      where: {
        topic: {
          subject: {
            name: {
              in: ['Conhecimentos Específicos', 'Língua Portuguesa', 'Matemática']
            }
          }
        }
      },
      take: 10,
    });
    console.log(`✅ Conseguiu buscar ${questionsTec.length} questões direcionadas para Nível Técnico.`);
  }

}

runTests().then(() => prisma.$disconnect()).catch(console.error);
