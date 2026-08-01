const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const questions = [
    {
      topicId: '5abbc8cb-30f1-4a6b-8413-5f014dd7ca8e',
      bank: 'CESGRANRIO',
      year: 2024,
      statement: 'No texto, o trecho "A inovação não é uma opção, mas uma exigência para a sobrevivência das empresas de energia no século XXI" revela um tom de:',
      correctOption: 1,
      explanation: 'O autor usa uma conjunção adversativa (mas) com valor aditivo/enfático para reforçar a obrigatoriedade da inovação, denotando alerta ou urgência.',
      options: ['A) ironia.', 'B) advertência.', 'C) conformismo.', 'D) hesitação.', 'E) sarcasmo.']
    },
    {
      topicId: '1fed706b-784d-4a0a-9d71-79a0f275ea9d',
      bank: 'CESGRANRIO',
      year: 2023,
      statement: 'Em qual das frases abaixo o uso da vírgula está INCORRETO segundo a norma-padrão?',
      correctOption: 2,
      explanation: 'A vírgula não deve separar o verbo (avaliou) de seu complemento (o relatório).',
      options: [
        'A) Os técnicos, que chegaram cedo, iniciaram a manutenção.',
        'B) Quando a pressão subiu, a válvula foi acionada imediatamente.',
        'C) O engenheiro chefe avaliou, o relatório técnico minuciosamente.',
        'D) Na plataforma, todos usavam EPI.',
        'E) Petróleo, gás natural e carvão são combustíveis fósseis.'
      ]
    },
    {
      topicId: 'b409d33d-e8d7-4ad4-99f8-06650ae2466d',
      bank: 'CESGRANRIO',
      year: 2022,
      statement: 'De acordo com a NR-10, as intervenções em instalações elétricas com tensão igual ou superior a 50 Volts em corrente alternada devem ser realizadas por trabalhadores:',
      correctOption: 3,
      explanation: 'A NR-10 estabelece que apenas trabalhadores qualificados, habilitados, capacitados e autorizados podem atuar no SEP ou em tensões superiores a 50V CA.',
      options: [
        'A) com ensino médio completo.',
        'B) que passaram por treinamento de primeiros socorros apenas.',
        'C) supervisionados por um engenheiro civil.',
        'D) qualificados, habilitados, capacitados e autorizados.',
        'E) temporários sob supervisão.'
      ]
    },
    {
      topicId: '8217bb6b-e1fe-4c06-9f4c-b0681eb93395',
      bank: 'CESGRANRIO',
      year: 2023,
      statement: 'De acordo com a Segunda Lei da Termodinâmica, é impossível construir uma máquina térmica operando em ciclos que converta:',
      correctOption: 0,
      explanation: 'O enunciado de Kelvin-Planck da Segunda Lei afirma que não existe máquina térmica perfeita (rendimento de 100%).',
      options: [
        'A) todo o calor absorvido de uma fonte quente em trabalho útil.',
        'B) trabalho em calor.',
        'C) energia cinética em energia potencial gravitacional.',
        'D) calor de uma fonte fria para uma fonte quente com trabalho.',
        'E) pressão em volume de forma isotérmica.'
      ]
    },
    {
      topicId: '04203603-9301-4d42-afd4-67117c36e781',
      bank: 'CESGRANRIO',
      year: 2024,
      statement: 'Qual é o nome do princípio que estabelece que "em um fluido incompressível e sem atrito, a soma das energias cinética, potencial e de pressão é constante ao longo de uma linha de corrente"?',
      correctOption: 1,
      explanation: 'Este é o Teorema de Bernoulli, pilar da dinâmica dos fluidos.',
      options: [
        'A) Princípio de Pascal.',
        'B) Equação de Bernoulli.',
        'C) Lei de Stevin.',
        'D) Princípio de Arquimedes.',
        'E) Equação da Continuidade.'
      ]
    },
    {
      topicId: '604564a9-d9ab-460a-9ce4-8791fd89e2a2',
      bank: 'CESGRANRIO',
      year: 2021,
      statement: 'Um investimento inicial de R$ 10.000,00 aplicado a juros compostos de 10% ao ano produzirá, ao final de 2 anos, um montante de:',
      correctOption: 2,
      explanation: 'M = P(1+i)^n -> M = 10000 * (1.10)^2 = 10000 * 1.21 = 12.100,00.',
      options: [
        'A) R$ 11.000,00',
        'B) R$ 12.000,00',
        'C) R$ 12.100,00',
        'D) R$ 12.210,00',
        'E) R$ 13.000,00'
      ]
    },
    {
      topicId: '881393ad-382b-45ba-944f-5ed1eaa74a43',
      bank: 'CESGRANRIO',
      year: 2022,
      statement: 'No lançamento simultâneo de 2 dados honestos de 6 faces, qual é a probabilidade de a soma das faces voltadas para cima ser igual a 7?',
      correctOption: 3,
      explanation: 'Casos possíveis = 36. Casos favoráveis para soma 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 casos. 6/36 = 1/6.',
      options: [
        'A) 1/12',
        'B) 1/36',
        'C) 1/2',
        'D) 1/6',
        'E) 7/36'
      ]
    },
    {
      topicId: '1fed706b-784d-4a0a-9d71-79a0f275ea9d',
      bank: 'CESGRANRIO',
      year: 2024,
      statement: 'Assinale a alternativa em que a pontuação foi usada corretamente para isolar um vocativo:',
      correctOption: 0,
      explanation: 'O vocativo (Técnicos) deve vir obrigatoriamente separado por vírgula.',
      options: [
        'A) Técnicos, verifiquem a pressão das válvulas agora.',
        'B) Verifiquem a pressão das válvulas agora técnicos.',
        'C) Os técnicos, chegaram na plataforma.',
        'D) Foi solicitado, técnicos para a manutenção.',
        'E) A pressão das válvulas, técnicos verificaram.'
      ]
    }
  ];

  let count = 0;
  for (const q of questions) {
    await prisma.question.create({
      data: {
        topicId: q.topicId,
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
  console.log(`Successfully injected ${count} premium CESGRANRIO questions!`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
