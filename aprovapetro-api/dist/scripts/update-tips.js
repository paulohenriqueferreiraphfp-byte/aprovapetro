"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const tips = [
    {
        match: 'equação de Bernoulli',
        tip: 'Lembre-se: Bernoulli = "B" de Básico (Ideal). O fluido deve ser incompressível e NÃO viscoso para que a energia mecânica se conserve perfeitamente sem perdas por atrito!'
    },
    {
        match: 'número de Reynolds',
        tip: 'O macete é pensar em "Forças Inerciais vs Viscosas". Reynolds baixo = predominância da viscosidade (Laminar). Reynolds alto = inércia vence a viscosidade (Turbulento).'
    },
    {
        match: 'método de reflexão',
        tip: 'A palavra-chave é "Reflexão Acústica"! Assim como um eco, o som bate e volta em camadas de rochas com densidades e impedâncias acústicas diferentes.'
    },
    {
        match: 'técnica PERT',
        tip: 'PERT usa a fórmula (Otimista + 4*Mais Provável + Pessimista) / 6. Grave essas 3 estimativas na cabeça para nunca errar cálculos de projetos!'
    },
    {
        match: 'conversor Buck',
        tip: 'Buck significa "reduzir" (step-down). Se a corrente no indutor nunca zera, é porque o modo de condução é Contínuo! Macete: Buck abaixa a tensão.'
    },
    {
        match: 'pontuação é essencial',
        tip: 'A regra de ouro: NUNCA se separa o Sujeito do Verbo, nem o Verbo do Complemento com vírgula! Se bater a dúvida, tente achar o sujeito da frase.'
    },
    {
        match: 'depreciação anual de 10%',
        tip: 'Atenção redobrada: Depreciação composta não é juros simples! Você precisa descontar 10% de 10.000, e depois 10% do NOVO valor (9.000). Não faça (10+10 = 20%)!'
    },
    {
        match: 'adornos pessoais',
        tip: 'A NR-10 é absoluta sobre isso! Metais conduzem eletricidade e derretem no corpo em caso de arco elétrico. A regra é: NENHUM adorno é permitido, sem exceções!'
    },
    {
        match: 'ciclo termodinâmico ideal',
        tip: 'Macete das Vogais: mOtOr = Otto (Gasolina). Diesel tem centelha? Não, funciona por compressão! Portanto, gasolina = Otto.'
    },
    {
        match: 'palavra "destarte"',
        tip: '"Destarte" é sinônimo chique de "Portanto" ou "Sendo assim". É sempre usado para concluir uma ideia forte no fim do parágrafo!'
    },
    {
        match: 'comissão de 2 pessoas',
        tip: 'Probabilidade de retirar SEM reposição! A primeira chance é 4 em 10. A segunda chance cai para 3 em 9. Multiplique as duas!'
    },
    {
        match: 'carga instalada superior a 75 kW',
        tip: 'A palavra mágica é o PIE (Prontuário de Instalações Elétricas). Qualquer estabelecimento grandinho (75 kW+) exige PIE!'
    },
    {
        match: 'uso da crase',
        tip: 'Macete clássico: Vou A, Volto DA -> Crase HÁ! Se vou A, volto DE -> Crase pra quê? E nunca use crase antes de verbo!'
    },
    {
        match: 'impossível construir uma máquina operando',
        tip: 'Esta é a 2ª Lei da Termodinâmica (Enunciado de Kelvin-Planck). É impossível transformar 100% de calor em trabalho; sempre há perdas!'
    },
    {
        match: 'juros simples com uma taxa',
        tip: 'Fórmula rápida de Juros Simples: J = C * i * t (Juros = Capital x Taxa x Tempo). É linear, não acumula juros sobre juros!'
    }
];
async function main() {
    const questions = await prisma.question.findMany();
    for (const q of questions) {
        const tipObj = tips.find(t => q.statement.includes(t.match));
        if (tipObj) {
            await prisma.question.update({
                where: { id: q.id },
                data: { tip: tipObj.tip }
            });
            console.log(`Updated tip for: ${tipObj.match}`);
        }
    }
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=update-tips.js.map