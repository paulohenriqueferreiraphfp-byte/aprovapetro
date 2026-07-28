"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdfParse = require('pdf-parse');
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const PROVAS_DIRS = [
    path.join(__dirname, '../../PROVA 1'),
    path.join(__dirname, '../../PROVA 2'),
    path.join(__dirname, '../../PROVA 3'),
];
async function parseGabarito(pdfPath) {
    if (!fs.existsSync(pdfPath))
        return {};
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    const regex = /(\d{1,2})\s*[-:]?\s*([A-E])/g;
    const gabarito = {};
    const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
    let match;
    while ((match = regex.exec(text)) !== null) {
        const qNum = parseInt(match[1]);
        const letter = match[2].toUpperCase();
        gabarito[qNum] = letterToIndex[letter];
    }
    return gabarito;
}
async function parseProva(pdfPath, gabarito) {
    if (!fs.existsSync(pdfPath))
        return [];
    console.log(`Lendo prova: ${path.basename(pdfPath)}...`);
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    const questionBlocks = text.split(/(?=\n\s*\d{1,2}\s*\n)/);
    const extractedQuestions = [];
    for (const block of questionBlocks) {
        const match = block.match(/^\n?\s*(\d{1,2})\s*\n([\s\S]+?)\(A\)([\s\S]+?)\(B\)([\s\S]+?)\(C\)([\s\S]+?)\(D\)([\s\S]+?)\(E\)([\s\S]+)/);
        if (match) {
            const qNum = parseInt(match[1]);
            const statement = match[2].trim();
            const options = [
                match[3].trim(),
                match[4].trim(),
                match[5].trim(),
                match[6].trim(),
                match[7].split('\n\n')[0].trim()
            ];
            const correctOption = gabarito[qNum] !== undefined ? gabarito[qNum] : 0;
            if (statement.length > 20 && options.every(o => o.length > 0)) {
                extractedQuestions.push({
                    qNum,
                    statement,
                    options,
                    correctOption
                });
            }
        }
    }
    return extractedQuestions;
}
async function runImport() {
    console.log('🤖 Iniciando Robô Leitor de PDFs...');
    const defaultTopic = await prisma.topic.findFirst();
    if (!defaultTopic) {
        console.error('Nenhum tópico encontrado no banco de dados. Rode o seed primeiro.');
        return;
    }
    let totalInserted = 0;
    for (let i = 0; i < PROVAS_DIRS.length; i++) {
        const dir = PROVAS_DIRS[i];
        console.log(`\n📂 Verificando pasta: PROVA ${i + 1}`);
        if (!fs.existsSync(dir)) {
            console.log(`Pasta não encontrada: ${dir}`);
            continue;
        }
        const files = fs.readdirSync(dir);
        const gabaritoFile = files.find(f => f.toLowerCase().includes('gabarito'));
        const provaFile = files.find(f => f.toLowerCase().endsWith('.pdf') && !f.toLowerCase().includes('gabarito'));
        let gabarito = {};
        if (gabaritoFile) {
            console.log(`Lendo gabarito: ${gabaritoFile}`);
            gabarito = await parseGabarito(path.join(dir, gabaritoFile));
            console.log(`Gabarito extraído: ${Object.keys(gabarito).length} respostas encontradas.`);
        }
        if (provaFile) {
            const questions = await parseProva(path.join(dir, provaFile), gabarito);
            console.log(`Extraídas ${questions.length} questões com sucesso da prova.`);
            for (const q of questions) {
                await prisma.question.create({
                    data: {
                        topicId: defaultTopic.id,
                        bank: `Cesgranrio (PROVA ${i + 1})`,
                        year: 2024,
                        statement: q.statement.substring(0, 500) + (q.statement.length > 500 ? '...' : ''),
                        correctOption: q.correctOption,
                        explanation: `[Bot] Questão extraída do PDF PROVA ${i + 1}.`,
                        options: {
                            create: q.options.map((text, idx) => ({
                                text: text.substring(0, 150),
                                orderIndex: idx
                            }))
                        }
                    }
                });
                totalInserted++;
            }
        }
    }
    console.log(`\n✅ FINALIZADO! ${totalInserted} novas questões extraídas dos PDFs e injetadas no banco de dados!`);
}
runImport().catch(console.error);
//# sourceMappingURL=import-provas.js.map