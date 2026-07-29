"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Limpando banco de dados para o novo seed...');
    await prisma.userAnswer.deleteMany();
    await prisma.simuladoAttempt.deleteMany();
    await prisma.simuladoQuestion.deleteMany();
    await prisma.simulado.deleteMany();
    await prisma.option.deleteMany();
    await prisma.question.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.dailyMission.deleteMany();
    await prisma.cargo.deleteMany();
    await prisma.user.deleteMany();
    console.log('Inserindo Cargos (Nível Técnico Petrobras/Transpetro)...');
    const cargos = [
        { name: 'Técnico em Segurança do Trabalho', description: 'Prevenção de acidentes e NRs.', level: 'TÉCNICO' },
        { name: 'Técnico em Eletrotécnica', description: 'Manutenção elétrica e sistemas de potência.', level: 'TÉCNICO' },
        { name: 'Técnico em Mecânica', description: 'Manutenção de máquinas e equipamentos.', level: 'TÉCNICO' },
        { name: 'Técnico de Operação', description: 'Operação de processos de refino.', level: 'TÉCNICO' },
        { name: 'Engenheiro Mecânico', description: 'Projetos e manutenção mecânica avançada.', level: 'SUPERIOR' },
        { name: 'Engenheiro de Produção', description: 'Otimização e gestão de processos industriais.', level: 'SUPERIOR' },
        { name: 'Engenheiro Eletricista', description: 'Sistemas elétricos de alta tensão e automação.', level: 'SUPERIOR' },
        { name: 'Geólogo', description: 'Exploração e estudo de rochas e reservatórios.', level: 'SUPERIOR' },
        { name: 'Administrador', description: 'Gestão de recursos e contratos.', level: 'SUPERIOR' }
    ];
    for (const cargo of cargos) {
        await prisma.cargo.create({ data: cargo });
    }
    const user = await prisma.user.create({
        data: {
            email: 'admin@aprovapetro.com',
            name: 'Admin Petrobras',
            passwordHash: 'hashed_password_mock',
            indexAprovaPetro: 45,
            xp: 0,
        },
    });
    console.log('Inserindo Disciplinas e Tópicos...');
    const subjPort = await prisma.subject.create({
        data: {
            name: 'Língua Portuguesa',
            color: '#3B82F6',
            topics: { create: [{ name: 'Pontuação' }, { name: 'Compreensão de Textos' }] },
        },
        include: { topics: true },
    });
    const subjMat = await prisma.subject.create({
        data: {
            name: 'Matemática',
            color: '#EF4444',
            topics: { create: [{ name: 'Matemática Financeira' }, { name: 'Probabilidade' }] },
        },
        include: { topics: true },
    });
    const subjEsp = await prisma.subject.create({
        data: {
            name: 'Conhecimentos Específicos',
            color: '#00B37E',
            topics: { create: [{ name: 'NR-10' }, { name: 'Termodinâmica' }] },
        },
        include: { topics: true },
    });
    const subjEng = await prisma.subject.create({
        data: {
            name: 'Engenharia Específica',
            color: '#F59E0B',
            topics: { create: [{ name: 'Mecânica dos Fluidos' }, { name: 'Eletrônica de Potência' }, { name: 'Geofísica' }, { name: 'Gestão de Projetos' }] },
        },
        include: { topics: true },
    });
    console.log('Inserindo Questões reais da banca Cesgranrio...');
    const cesgranrioQuestions = [
        {
            topicId: subjPort.topics.find(t => t.name === 'Pontuação').id,
            bank: 'CESGRANRIO', year: 2024,
            statement: 'Em um texto formal, a pontuação é essencial para a clareza. Assinale a opção em que a vírgula está empregada de acordo com a norma-padrão da língua portuguesa:',
            correctOption: 0,
            explanation: 'A vírgula separa corretamente a oração subordinada adjetiva explicativa ("que conversava conosco"). As demais opções separam sujeito e verbo, ou verbo e complemento, o que é um erro gramatical grave.',
            options: [
                'A) Aquele rapaz, que conversava conosco, saiu apressado.',
                'B) Os engenheiros da empresa, aprovaram o novo projeto de extração.',
                'C) O diretor de operações exigiu, que todos os funcionários estivessem presentes.',
                'D) O técnico de segurança sempre achou, que o treinamento é fundamental.',
                'E) Quem trabalha focado e com segurança, acaba evitando muitos acidentes.'
            ]
        },
        {
            topicId: subjMat.topics.find(t => t.name === 'Matemática Financeira').id,
            bank: 'CESGRANRIO', year: 2023,
            statement: 'Um equipamento adquirido pela Petrobras sofre uma depreciação anual de 10% em relação ao valor do ano anterior. Se hoje o equipamento custa R$ 10.000,00, qual será o seu valor exato após 2 anos?',
            correctOption: 1,
            explanation: 'No 1º ano o valor cai 10% (10.000 - 1.000 = 9.000). No 2º ano, a queda é de 10% sobre 9.000 (9.000 - 900 = 8.100).',
            options: [
                'A) R$ 8.000,00', 'B) R$ 8.100,00', 'C) R$ 8.500,00', 'D) R$ 9.000,00', 'E) R$ 12.100,00'
            ]
        },
        {
            topicId: subjEsp.topics.find(t => t.name === 'NR-10').id,
            bank: 'CESGRANRIO', year: 2024,
            statement: 'Segundo a Norma Regulamentadora nº 10 (NR-10), em relação aos adornos pessoais, a norma estabelece expressamente que:',
            correctOption: 2,
            explanation: 'A NR-10.2.9.3 afirma: "É vedado o uso de adornos pessoais nos trabalhos com instalações elétricas ou em suas proximidades".',
            options: [
                'A) o uso é livre caso o profissional possua certificação válida para Alta Tensão.',
                'B) podem ser utilizados se estiverem cobertos por luvas isolantes.',
                'C) é vedado o uso de adornos pessoais nos trabalhos com instalações elétricas.',
                'D) anéis de ouro ou prata são permitidos pela baixa resistência.',
                'E) é permitido apenas o uso de relógios analógicos com pulseira de plástico.'
            ]
        },
        {
            topicId: subjEsp.topics.find(t => t.name === 'Termodinâmica').id,
            bank: 'CESGRANRIO', year: 2023,
            statement: 'Qual é o ciclo termodinâmico ideal que serve como modelo para motores de ignição por centelha (motores a gasolina)?',
            correctOption: 3,
            explanation: 'O Ciclo Otto é o modelo ideal termodinâmico para motores de ignição por centelha.',
            options: [
                'A) Ciclo Diesel.', 'B) Ciclo Brayton.', 'C) Ciclo Rankine.', 'D) Ciclo Otto.', 'E) Ciclo Carnot.'
            ]
        },
        {
            topicId: subjPort.topics.find(t => t.name === 'Compreensão de Textos').id,
            bank: 'CESGRANRIO', year: 2024,
            statement: 'A palavra "destarte" em um texto dissertativo possui a mesma função semântica de:',
            correctOption: 1,
            explanation: 'A palavra "destarte" é uma conjunção conclusiva, possuindo o mesmo sentido de "assim", "portanto", "dessa forma".',
            options: [
                'A) Embora', 'B) Portanto', 'C) Contudo', 'D) Todavia', 'E) Outrossim'
            ]
        },
        {
            topicId: subjMat.topics.find(t => t.name === 'Probabilidade').id,
            bank: 'CESGRANRIO', year: 2023,
            statement: 'Em um setor da Transpetro, há 4 técnicos de segurança e 6 técnicos de operação. Ao escolher aleatoriamente uma comissão de 2 pessoas, qual a probabilidade de ambos serem técnicos de segurança?',
            correctOption: 0,
            explanation: 'Total de modos de escolher 2 entre 10 = C(10,2) = 45. Escolher 2 entre 4 = C(4,2) = 6. Probabilidade = 6/45 = 2/15.',
            options: [
                'A) 2/15', 'B) 1/5', 'C) 3/10', 'D) 4/25', 'E) 1/3'
            ]
        },
        {
            topicId: subjEsp.topics.find(t => t.name === 'NR-10').id,
            bank: 'CESGRANRIO', year: 2021,
            statement: 'A NR-10 estabelece que as instalações elétricas devem ser mantidas em condições seguras. Qual documento é obrigatório para todos os estabelecimentos com carga instalada superior a 75 kW?',
            correctOption: 2,
            explanation: 'Segundo a NR 10.2.4, estabelecimentos com carga instalada superior a 75 kW devem constituir e manter o Prontuário de Instalações Elétricas (PIE).',
            options: [
                'A) Relatório de Impacto Ambiental (RIMA).',
                'B) Perfil Profissiográfico Previdenciário (PPP).',
                'C) Prontuário de Instalações Elétricas (PIE).',
                'D) Programa de Prevenção de Riscos Ambientais (PPRA).',
                'E) Laudo Técnico das Condições Ambientais de Trabalho (LTCAT).'
            ]
        },
        {
            topicId: subjPort.topics.find(t => t.name === 'Pontuação').id,
            bank: 'CESGRANRIO', year: 2023,
            statement: 'Assinale a alternativa onde o uso da crase está INCORRETO, segundo a norma culta:',
            correctOption: 3,
            explanation: 'Não se usa crase antes de verbos no infinitivo (ex: "a partir", "a fazer").',
            options: [
                'A) Vou à Bahia nas próximas férias.',
                'B) Refiro-me àquele funcionário recém-contratado.',
                'C) Entreguei o relatório às diretoras da empresa.',
                'D) A partir de amanhã, o acesso será restrito à diretoria.',
                'E) Chegamos às duas horas da tarde.'
            ]
        }
    ];
    cesgranrioQuestions[7].options[3] = 'D) Começou à chover fortemente na refinaria.';
    cesgranrioQuestions[7].explanation = 'Não se utiliza o acento indicativo de crase antes de verbos ("chover").';
    const extraQuestions = [
        {
            topicId: subjEsp.topics.find(t => t.name === 'Termodinâmica').id,
            bank: 'CESGRANRIO', year: 2024,
            statement: 'Qual é o princípio físico que afirma que é impossível construir uma máquina operando em ciclos cujo único efeito seja a extração de calor de um reservatório e a realização de trabalho equivalente?',
            correctOption: 1,
            explanation: 'Este é o enunciado de Kelvin-Planck para a Segunda Lei da Termodinâmica.',
            options: [
                'A) Primeira Lei da Termodinâmica.',
                'B) Segunda Lei da Termodinâmica (Kelvin-Planck).',
                'C) Terceira Lei da Termodinâmica.',
                'D) Lei Zero da Termodinâmica.',
                'E) Princípio de Bernoulli.'
            ]
        },
        {
            topicId: subjMat.topics.find(t => t.name === 'Matemática Financeira').id,
            bank: 'CESGRANRIO', year: 2021,
            statement: 'Se um capital de R$ 2.000,00 é aplicado a juros simples com uma taxa de 2% ao mês, qual será o montante gerado ao final de 6 meses?',
            correctOption: 4,
            explanation: 'Juros simples = C * i * t = 2000 * 0,02 * 6 = 240. Montante = 2000 + 240 = 2240.',
            options: [
                'A) R$ 2.120,00',
                'B) R$ 2.180,00',
                'C) R$ 2.200,00',
                'D) R$ 2.220,00',
                'E) R$ 2.240,00'
            ]
        }
    ];
    cesgranrioQuestions.push(...extraQuestions);
    const createdQuestions = [];
    for (const q of cesgranrioQuestions) {
        const created = await prisma.question.create({
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
        createdQuestions.push(created);
    }
    console.log('Criando Simulado...');
    const firstCargo = await prisma.cargo.findFirst();
    if (firstCargo) {
        const simulado = await prisma.simulado.create({
            data: {
                title: 'Simulado Transpetro 2024.1',
                description: 'Simulado completo focado no edital de nível técnico.',
                durationMin: 240,
                cargoId: firstCargo.id,
                questions: {
                    create: createdQuestions.map((q, idx) => ({
                        questionId: q.id,
                        orderIndex: idx
                    }))
                }
            }
        });
    }
    console.log('Banco de dados semeado com sucesso! Próximo passo: Onboarding.');
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
//# sourceMappingURL=seed.js.map