import * as fs from 'fs';
import * as path from 'path';
const pdfParse = require('pdf-parse');
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PROVAS_DIRS = [
  path.join(__dirname, '../../PROVA 1'),
  path.join(__dirname, '../../PROVA 2'),
  path.join(__dirname, '../../PROVA 3'),
];

async function parseGabarito(pdfPath: string): Promise<Record<number, number>> {
  if (!fs.existsSync(pdfPath)) return {};
  
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;
  
  // A simple heuristic for answer keys: usually looks like "1 - A", "2 - C", or a table.
  // This is highly variable, but we'll try to find numbers followed by A,B,C,D,E.
  const regex = /(\d{1,2})\s*[-:]?\s*([A-E])/g;
  const gabarito: Record<number, number> = {};
  
  const letterToIndex: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };

  let match;
  while ((match = regex.exec(text)) !== null) {
    const qNum = parseInt(match[1]);
    const letter = match[2].toUpperCase();
    gabarito[qNum] = letterToIndex[letter];
  }
  
  return gabarito;
}

async function parseProva(pdfPath: string, gabarito: Record<number, number>) {
  if (!fs.existsSync(pdfPath)) return [];
  
  console.log(`Lendo prova: ${path.basename(pdfPath)}...`);
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  const text = data.text;
  
  // Heuristic to find questions: "1 \n Enunciado... (A) ... (B) ... (C) ... (D) ... (E) ..."
  // This is a simplified regex that works on some formats.
  const questionBlocks = text.split(/(?=\n\s*\d{1,2}\s*\n)/); // Split by question numbers roughly
  
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
        match[7].split('\n\n')[0].trim() // Try to cut off before next text
      ];
      
      const correctOption = gabarito[qNum] !== undefined ? gabarito[qNum] : 0; // fallback to A
      
      // Clean up statement a bit
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
      
      // Insert into DB
      for (const q of questions) {
        await prisma.question.create({
          data: {
            topicId: defaultTopic.id,
            bank: `Cesgranrio (PROVA ${i + 1})`,
            year: 2024,
            statement: q.statement.substring(0, 500) + (q.statement.length > 500 ? '...' : ''), // Limit length just in case
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
