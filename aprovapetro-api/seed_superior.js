const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const questions = [
    {
      topicId: '04203603-9301-4d42-afd4-67117c36e781',
      level: 'SUPERIOR',
      bank: 'CESGRANRIO',
      year: 2024,
      statement: 'Na análise do escoamento de um fluido Newtoniano em regime laminar no interior de um tubo cilíndrico liso, a perda de carga distribuída é inversamente proporcional a qual potência do diâmetro do tubo?',
      correctOption: 2,
      explanation: 'Pela equação de Hagen-Poiseuille, a perda de carga é inversamente proporcional à quarta potência do raio, logo, inversamente proporcional à quarta potência do diâmetro.',
      options: ['A) Segunda potência.', 'B) Terceira potência.', 'C) Quarta potência.', 'D) Quinta potência.', 'E) Primeira potência.']
    },
    {
      topicId: '57dd997b-8f89-448e-940f-01627950fa36',
      level: 'SUPERIOR',
      bank: 'CESGRANRIO',
      year: 2023,
      statement: 'Um conversor Buck é operado no modo de condução contínua. Se a tensão de entrada é 50V e o ciclo de trabalho (duty cycle) é 40%, qual é a tensão média teórica na saída?',
      correctOption: 1,
      explanation: 'No conversor Buck (abaixador) em modo contínuo, V_out = D * V_in. Assim, 0,4 * 50 = 20V.',
      options: ['A) 15V', 'B) 20V', 'C) 25V', 'D) 30V', 'E) 50V']
    },
    {
      topicId: '29f9552e-3114-407f-9528-a835ec173ceb',
      level: 'SUPERIOR',
      bank: 'CESGRANRIO',
      year: 2022,
      statement: 'No método sísmico de reflexão, comumente empregado na exploração de hidrocarbonetos, a reflexão de uma onda P em uma interface depende diretamente do contraste de:',
      correctOption: 3,
      explanation: 'A reflexão sísmica depende do contraste de impedância acústica (produto da densidade pela velocidade da onda) entre as camadas rochosas.',
      options: ['A) Condutividade elétrica.', 'B) Suscetibilidade magnética.', 'C) Porosidade absoluta.', 'D) Impedância acústica.', 'E) Permeabilidade intrínseca.']
    },
    {
      topicId: '084e1123-a53d-4eb9-9497-23c036a7cb18',
      level: 'SUPERIOR',
      bank: 'CESGRANRIO',
      year: 2024,
      statement: 'Na gestão de projetos utilizando a metodologia PMI/PMBOK, a técnica de compressão de cronograma que envolve a adição de recursos às atividades do caminho crítico, resultando em aumento de custos, é chamada de:',
      correctOption: 0,
      explanation: 'Crashing (Compressão) consiste em alocar mais recursos para reduzir o tempo, geralmente aumentando os custos.',
      options: ['A) Crashing.', 'B) Fast Tracking (Paralelismo).', 'C) Nivelamento de Recursos.', 'D) Análise de Variância.', 'E) Diagrama de Ishikawa.']
    },
    {
      topicId: '04203603-9301-4d42-afd4-67117c36e781',
      level: 'SUPERIOR',
      bank: 'CESGRANRIO',
      year: 2022,
      statement: 'O número de Reynolds é um parâmetro adimensional fundamental na mecânica dos fluidos. Ele expressa a relação entre:',
      correctOption: 4,
      explanation: 'O número de Reynolds é a razão entre as forças inerciais e as forças viscosas no escoamento do fluido.',
      options: ['A) Forças elásticas e forças gravitacionais.', 'B) Forças de pressão e forças de tensão superficial.', 'C) Forças viscosas e forças elásticas.', 'D) Forças inerciais e forças elásticas.', 'E) Forças inerciais e forças viscosas.']
    }
  ];

  let count = 0;
  for (const q of questions) {
    await prisma.question.create({
      data: {
        topicId: q.topicId,
        level: q.level,
        bank: q.bank,
        year: q.year,
        statement: q.statement,
        correctOption: q.correctOption,
        explanation: q.explanation,
        options: {
          create: q.options.map((optText, index) => ({
            text: optText,
            orderIndex: index
          }))
        }
      }
    });
    count++;
  }
  console.log(`Successfully injected ${count} premium CESGRANRIO questions for Nível Superior!`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
