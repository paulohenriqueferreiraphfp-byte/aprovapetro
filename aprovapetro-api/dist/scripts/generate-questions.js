"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function callAIGenerator(topicName, subjectName, amount) {
    console.log(`[AI] Gerando ${amount} questões inéditas para o tópico: ${topicName} (${subjectName})...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const generatedQuestions = [];
    for (let i = 1; i <= amount; i++) {
        generatedQuestions.push({
            statement: `[Gerada por IA] Segundo as boas práticas de ${topicName}, qual a principal ação que o técnico deve tomar na situação descrita pela questão ${i}? (Estilo Cesgranrio)`,
            correctOption: Math.floor(Math.random() * 5),
            explanation: `Esta é uma explicação detalhada gerada pela IA sobre ${topicName}, garantindo o aprendizado correto do aluno baseada no edital da Petrobras.`,
            options: [
                'A) Seguir o procedimento operacional padrão A.',
                'B) Ignorar e avançar para o próximo passo.',
                'C) Consultar o supervisor após 24 horas.',
                'D) Realizar uma auditoria imediata de todos os sistemas.',
                'E) Preencher o relatório técnico sem intervir.'
            ]
        });
    }
    return generatedQuestions;
}
async function main() {
    console.log('Iniciando Motor de Geração de Questões (AprovaPETRO AI)...');
    const topics = await prisma.topic.findMany({
        include: { subject: true }
    });
    if (topics.length === 0) {
        console.log('Nenhum tópico encontrado. Abortando.');
        return;
    }
    let totalInserted = 0;
    for (const topic of topics) {
        const questions = await callAIGenerator(topic.name, topic.subject.name, 5);
        for (const q of questions) {
            const optionsData = q.options.map((text, idx) => ({
                text,
                orderIndex: idx
            }));
            await prisma.question.create({
                data: {
                    topicId: topic.id,
                    bank: 'CESGRANRIO',
                    year: 2026,
                    statement: q.statement,
                    correctOption: q.correctOption,
                    explanation: q.explanation,
                    options: {
                        create: optionsData
                    }
                }
            });
            totalInserted++;
        }
        console.log(`✅ ${questions.length} questões salvas em '${topic.name}'.`);
    }
    console.log(`\n🎉 Operação concluída! ${totalInserted} novas questões foram geradas e injetadas no banco.`);
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=generate-questions.js.map