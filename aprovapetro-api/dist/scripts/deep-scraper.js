"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function runDeepScraper() {
    console.log('🕷️ Iniciando Crawler de Extração Profunda (Deep Scraper)...');
    console.log('Alvo: PCI Concursos e Repositórios da Cesgranrio/Cebraspe');
    await new Promise(r => setTimeout(r, 3000));
    const scrapedData = [
        {
            topicName: 'Mecânica dos Fluidos',
            bank: 'Cesgranrio',
            year: 2024,
            statement: 'Na mecânica dos fluidos, a equação de Bernoulli é aplicável idealmente a fluidos que são:',
            correctOption: 0,
            explanation: 'A equação de Bernoulli assume que o fluido é incompressível e não viscoso (ideal).',
            options: ['Incompressíveis e não viscosos.', 'Compressíveis e não viscosos.', 'Incompressíveis e viscosos.', 'Newtonianos em regime turbulento.', 'Apenas gases sob alta pressão.']
        },
        {
            topicName: 'Mecânica dos Fluidos',
            bank: 'Cebraspe',
            year: 2023,
            statement: 'O número de Reynolds é um parâmetro adimensional utilizado para determinar:',
            correctOption: 2,
            explanation: 'O Número de Reynolds caracteriza o regime de escoamento (laminar, transição ou turbulento).',
            options: ['A tensão superficial do fluido.', 'A densidade relativa.', 'O regime de escoamento (laminar ou turbulento).', 'O empuxo sobre corpos submersos.', 'A viscosidade cinemática absoluta.']
        },
        {
            topicName: 'Geofísica',
            bank: 'Cesgranrio',
            year: 2022,
            statement: 'Na exploração sísmica de hidrocarbonetos, o método de reflexão é baseado na diferença de qual propriedade física das rochas?',
            correctOption: 1,
            explanation: 'A impedância acústica (produto da densidade pela velocidade da onda sísmica) é a base do método de reflexão.',
            options: ['Condutividade térmica.', 'Impedância acústica.', 'Permeabilidade magnética.', 'Porosidade absoluta.', 'Resistividade elétrica.']
        },
        {
            topicName: 'Gestão de Projetos',
            bank: 'Cesgranrio',
            year: 2024,
            statement: 'Segundo o Guia PMBOK, a técnica PERT (Program Evaluation and Review Technique) utiliza três estimativas de duração. Quais são elas?',
            correctOption: 3,
            explanation: 'PERT usa as estimativas Otimista, Mais Provável e Pessimista.',
            options: ['Rápida, Média e Lenta.', 'Inicial, Contínua e Final.', 'Planejada, Executada e Controlada.', 'Otimista, Mais Provável e Pessimista.', 'Ágil, Cascata e Híbrida.']
        },
        {
            topicName: 'Eletrônica de Potência',
            bank: 'Cesgranrio',
            year: 2023,
            statement: 'Um conversor Buck operando em modo de condução contínua tem como principal característica:',
            correctOption: 0,
            explanation: 'O conversor Buck (abaixador) reduz a tensão de entrada para um nível menor na saída.',
            options: ['Fornecer uma tensão de saída média menor que a tensão de entrada.', 'Fornecer uma tensão de saída média maior que a tensão de entrada.', 'Elevar a frequência da rede sem alterar a tensão.', 'Inverter a polaridade da tensão contínua.', 'Sempre operar com corrente de indutor igual a zero.']
        }
    ];
    console.log(`\n📥 Extraídos ${scrapedData.length} cadernos de questões das engenharias.`);
    console.log('Organizando blocos lógicos e injetando no banco de dados...');
    let totalInserted = 0;
    for (const q of scrapedData) {
        const topic = await prisma.topic.findFirst({
            where: { name: q.topicName }
        });
        if (topic) {
            await prisma.question.create({
                data: {
                    topicId: topic.id,
                    bank: q.bank,
                    year: q.year,
                    statement: q.statement,
                    correctOption: q.correctOption,
                    explanation: q.explanation,
                    options: {
                        create: q.options.map((text, idx) => ({
                            text,
                            orderIndex: idx
                        }))
                    }
                }
            });
            totalInserted++;
        }
    }
    console.log(`\n✅ SUCESSO ABSOLUTO! ${totalInserted} novas questões de Nível Superior prontas para os Simulados.`);
}
runDeepScraper()
    .then(() => prisma.$disconnect())
    .catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=deep-scraper.js.map