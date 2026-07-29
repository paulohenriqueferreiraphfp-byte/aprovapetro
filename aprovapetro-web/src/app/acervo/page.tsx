'use client';
import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { TopHeader } from '@/components/TopHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, UploadCloud, Cpu, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROVAS_MOCK = [
  {
    id: 1,
    year: '2024',
    title: 'Técnico de Operação Júnior',
    banca: 'Cebraspe',
    orgao: 'Petrobras',
    status: 'available',
    pdfLink: '#',
    gabaritoLink: '#'
  },
  {
    id: 2,
    year: '2023',
    title: 'Técnico de Operação Júnior',
    banca: 'Cebraspe',
    orgao: 'Transpetro',
    status: 'available',
    pdfLink: '#',
    gabaritoLink: '#'
  },
  {
    id: 3,
    year: '2021',
    title: 'Técnico de Operação Júnior',
    banca: 'Cesgranrio',
    orgao: 'Petrobras',
    status: 'available',
    pdfLink: '#',
    gabaritoLink: '#'
  },
  {
    id: 4,
    year: '2018',
    title: 'Técnico de Operação Júnior',
    banca: 'Cesgranrio',
    orgao: 'Transpetro',
    status: 'premium',
    pdfLink: '#',
    gabaritoLink: '#'
  }
];

export default function AcervoPage() {
  const [activeTab, setActiveTab] = useState<'provas' | 'extrator'>('provas');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState(0);

  const handleExtract = async () => {
    if (!file) {
      alert("Por favor, selecione um arquivo PDF primeiro!");
      return;
    }

    setIsExtracting(true);
    setExtractSuccess(false);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      // Podemos adicionar inputs para isso depois, por enquanto vai genérico
      formData.append('title', file.name.replace('.pdf', ''));
      formData.append('banca', 'Desconhecida');
      formData.append('orgao', 'Concurso');
      formData.append('year', new Date().getFullYear().toString());
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/extract`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao extrair questões.');
      }

      setSuccessCount(data.savedCount || 0);
      setExtractSuccess(true);
      setFile(null);
      setTimeout(() => setExtractSuccess(false), 5000);
    } catch (error: any) {
      setErrorMsg(error.message || 'Falha na conexão com a IA.');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="h-full bg-[#0A0F0D] text-white flex flex-col relative pb-20">
      <TopHeader />

      <main className="flex-1 overflow-y-auto p-5 pb-8">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Acervo & Biblioteca</h1>
          <p className="text-sm text-zinc-400">Baixe provas oficiais ou utilize nossa IA para extrair questões automaticamente.</p>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-[#111C22] p-1 rounded-xl mb-6">
          <button 
            onClick={() => setActiveTab('provas')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'provas' ? 'bg-[#3ADB6E] text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            Baixar Provas
          </button>
          <button 
            onClick={() => setActiveTab('extrator')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'extrator' ? 'bg-[#F5C518] text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
          >
            <Cpu className="w-4 h-4" /> Extrator PETRA IA
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'provas' && (
            <motion.div
              key="provas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {PROVAS_MOCK.map((prova) => (
                <Card key={prova.id} className="bg-[#111C22] border-zinc-800/50 overflow-hidden relative">
                  {prova.status === 'premium' && (
                    <div className="absolute top-0 right-0 bg-[#F5C518] text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                      <Lock className="w-3 h-3" /> PRO
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="bg-[#18181B] p-3 rounded-xl border border-zinc-800 flex-shrink-0">
                        <FileText className="w-8 h-8 text-[#3ADB6E]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-zinc-700 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{prova.banca}</span>
                          <span className="text-[#3ADB6E] text-[10px] font-bold uppercase">{prova.orgao} • {prova.year}</span>
                        </div>
                        <h3 className="font-bold text-base text-white leading-tight mb-4">{prova.title}</h3>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 bg-white text-black border-zinc-200 hover:bg-zinc-200 hover:text-black text-xs font-bold h-9 shadow-sm"
                            onClick={() => alert('Download do PDF da Prova (Em breve, conectado ao Banco de Dados)')}
                          >
                            <Download className="w-3 h-3 mr-1 text-[#0A0F0D]" /> Prova
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 bg-white text-black border-zinc-200 hover:bg-zinc-200 hover:text-black text-xs font-bold h-9 shadow-sm"
                            onClick={() => alert('Download do Gabarito Oficial')}
                          >
                            <Download className="w-3 h-3 mr-1 text-[#0A0F0D]" /> Gabarito
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {activeTab === 'extrator' && (
            <motion.div
              key="extrator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="bg-[#111C22] border-[#F5C518]/30">
                <CardContent className="p-6 text-center">
                  <div className="bg-[#F5C518]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#F5C518]/30">
                    <Cpu className="w-8 h-8 text-[#F5C518]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#F5C518] mb-2">Visão Computacional</h2>
                  <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                    Faça upload de uma prova em PDF e a PETRA IA fará a leitura ótica, separando enunciados das alternativas e injetando diretamente no Banco de Questões do app.
                  </p>

                  <div className="border-2 border-dashed border-zinc-700 hover:border-[#F5C518] transition-colors bg-[#0A0F0D] rounded-2xl p-8 mb-6 relative overflow-hidden cursor-pointer">
                    <input 
                      type="file" 
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFile(e.target.files[0]);
                          setErrorMsg('');
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {isExtracting ? (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-[#F5C518]/30 border-t-[#F5C518] rounded-full animate-spin mb-4" />
                        <p className="text-[#F5C518] font-bold text-sm">A IA está lendo o PDF...</p>
                        <p className="text-xs text-zinc-500 mt-1">Extraindo enunciados e alternativas (pode levar 1 min)</p>
                      </div>
                    ) : extractSuccess ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-12 h-12 text-[#3ADB6E] mb-4" />
                        <p className="text-[#3ADB6E] font-bold text-sm">Extração Concluída!</p>
                        <p className="text-xs text-zinc-500 mt-1">{successCount} questões cadastradas no Banco de Dados.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        {file ? (
                          <>
                            <FileText className="w-10 h-10 text-[#F5C518] mb-3" />
                            <p className="text-sm font-bold text-white mb-1 truncate max-w-full px-4">{file.name}</p>
                            <p className="text-xs text-[#3ADB6E]">Pronto para extração!</p>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-10 h-10 text-zinc-500 mb-3" />
                            <p className="text-sm font-bold text-zinc-300 mb-1">Toque para selecionar a Prova (PDF)</p>
                            <p className="text-xs text-zinc-500">Tamanho máximo: 10MB</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {errorMsg && (
                    <div className="text-red-500 text-xs font-bold mb-4">{errorMsg}</div>
                  )}

                  <Button 
                    onClick={handleExtract}
                    disabled={isExtracting || extractSuccess}
                    className="w-full bg-[#F5C518] text-black hover:bg-[#d9a51c] font-bold py-6 rounded-xl text-lg shadow-[0_0_15px_rgba(245,197,24,0.3)] disabled:opacity-50 disabled:shadow-none"
                  >
                    INICIAR EXTRAÇÃO IA
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
