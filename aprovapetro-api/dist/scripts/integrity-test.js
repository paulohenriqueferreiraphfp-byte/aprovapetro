"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function runTests() {
    console.log('--- TESTE DE INTEGRIDADE DO APROVAPETRO ---');
    const cargos = await prisma.cargo.findMany();
    console.log(`\n✅ Cargos encontrados: ${cargos.length}`);
    const tecnicos = cargos.filter((c) => c.level === 'TÉCNICO');
    const superiores = cargos.filter((c) => c.level === 'SUPERIOR');
    console.log(`- Técnicos: ${tecnicos.length}`);
    console.log(`- Superiores: ${superiores.length}`);
    const subjects = await prisma.subject.findMany({ include: { topics: true } });
    console.log(`\n✅ Disciplinas cadastradas: ${subjects.length}`);
    let totalTopics = 0;
    for (const s of subjects) {
        console.log(`  - ${s.name} (Tópicos: ${s.topics.length})`);
        totalTopics += s.topics.length;
    }
    const questions = await prisma.question.findMany();
    console.log(`\n✅ Banco de Questões: ${questions.length} cadastradas no total.`);
    console.log('\n--- TESTE DE LÓGICA DE SIMULADOS ---');
    const engMecanico = cargos.find((c) => c.name === 'Engenheiro Mecânico');
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
        if (questionsEng.length === 0) {
            console.log('❌ FALHA: Faltam questões de nível superior no banco! O scraper gerou questões?');
        }
    }
    const tecOp = cargos.find((c) => c.name === 'Técnico de Operação');
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
//# sourceMappingURL=integrity-test.js.map