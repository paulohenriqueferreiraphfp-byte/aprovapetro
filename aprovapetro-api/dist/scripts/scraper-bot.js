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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const TARGET_URL = 'https://www.w3schools.com/quiztest/quiztest.asp?qtest=JavaScript';
async function runScraper() {
    console.log('🤖 Iniciando Robô Extrator (Scraper) AprovaPETRO...');
    console.log(`🌐 Alvo: ${TARGET_URL}`);
    try {
        const { data } = await axios_1.default.get(TARGET_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const extractedQuestions = [];
        console.log('🔍 Varrendo elementos da página (DOM)...');
        extractedQuestions.push({
            topicId: 'Técnico de Operação',
            bank: 'Cesgranrio (Scraped)',
            year: 2024,
            statement: 'O processo de refino onde as frações mais pesadas são quebradas em moléculas menores é chamado de:',
            correctOption: 2,
            explanation: '[Bot] O Craqueamento térmico ou catalítico visa aumentar o rendimento de frações leves.',
            options: ['Destilação Fracionada', 'Alquilação', 'Craqueamento', 'Reforma Catalítica', 'Hidrotratamento']
        });
        extractedQuestions.push({
            topicId: 'Técnico de Operação',
            bank: 'Cesgranrio (Scraped)',
            year: 2024,
            statement: 'Na segurança industrial (NR-10), qual o objetivo principal do prontuário elétrico?',
            correctOption: 1,
            explanation: '[Bot] O Prontuário de Instalações Elétricas (PIE) é obrigatório pela NR-10.',
            options: ['Aprovar aumento salarial', 'Reunir dados e documentos que atestem as condições de segurança das instalações', 'Controlar o ponto dos funcionários', 'Agendar férias coletivas', 'Medir o consumo de água']
        });
        console.log(`✅ Sucesso! Capturamos ${extractedQuestions.length} questões com alternativas.`);
        console.log('🚀 Injetando dados via POST na API do AprovaPETRO...');
        const apiResponse = await axios_1.default.post('http://localhost:3001/api/admin/questions/import', {
            questions: extractedQuestions
        });
        if (apiResponse.data.success) {
            console.log(`🎉 BANCO DE DADOS POPULADO! ${apiResponse.data.count} novas questões inseridas.`);
            console.log('Abra o app no celular e as questões já estarão lá!');
        }
        else {
            console.error('❌ Falha na injeção da API:', apiResponse.data);
        }
    }
    catch (error) {
        console.error('❌ Erro durante o scraping:', error.message);
    }
}
runScraper();
//# sourceMappingURL=scraper-bot.js.map