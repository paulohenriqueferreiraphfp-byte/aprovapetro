'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileJson, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminImport() {
  const [jsonText, setJsonText] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!jsonText.trim()) return;
    setLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      // Validate JSON
      const parsedData = JSON.parse(jsonText);
      
      const res = await fetch(`https://aprovapetro.onrender.com/api/admin/questions/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: Array.isArray(parsedData) ? parsedData : [parsedData] })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus({ type: 'success', message: `Sucesso! ${data.count} questões foram importadas para o banco.` });
        setJsonText('');
      } else {
        setStatus({ type: 'error', message: data.message || 'Erro ao importar as questões.' });
      }
    } catch (e: any) {
      console.error(e);
      setStatus({ type: 'error', message: 'JSON Inválido ou erro de conexão. Certifique-se de que o texto é um JSON válido.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#121214] text-white">
      {/* Sidebar - Admin Edition */}
      <aside className="w-64 bg-[#18181B] border-r border-zinc-800 p-6 flex flex-col gap-6">
        <div className="text-2xl font-bold text-[#00B37E]">AprovaPETRO <span className="text-xs text-red-500 ml-1">ADMIN</span></div>
        <nav className="flex flex-col gap-2">
          <Link href="/" className="px-4 py-2 hover:bg-zinc-800 rounded-md text-sm font-medium text-zinc-400">Voltar ao App</Link>
          <Link href="/admin/importar" className="px-4 py-2 bg-zinc-800 rounded-md text-sm font-medium">Importador em Massa</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Importador de Questões</h1>
          <p className="text-zinc-400 mt-2">Use esta ferramenta para popular o banco de dados em massa colando pacotes de questões estruturadas em JSON.</p>
        </header>

        <Card className="bg-[#18181B] border-zinc-800 max-w-4xl">
          <CardHeader>
            <CardTitle className="text-[#00B37E] flex items-center gap-2">
              <FileJson className="w-5 h-5" /> Importar via JSON
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Cole abaixo um Array de objetos JSON contendo: topicId, bank, year, statement, correctOption, explanation e options (Array de strings).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {status.type === 'success' && (
              <div className="p-4 bg-[#00B37E]/10 border border-[#00B37E] text-[#00B37E] rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {status.message}
              </div>
            )}
            
            {status.type === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {status.message}
              </div>
            )}

            <textarea 
              className="w-full h-96 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm font-mono focus:border-[#00B37E] outline-none"
              placeholder={'[\n  {\n    "topicId": "UUID-DO-TOPICO",\n    "bank": "CESGRANRIO",\n    "year": 2024,\n    "statement": "Enunciado da questão...",\n    "correctOption": 1,\n    "explanation": "Explicação detalhada",\n    "options": ["A", "B", "C", "D", "E"]\n  }\n]'}
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
            />
            
            <Button 
              onClick={handleImport} 
              disabled={loading || !jsonText.trim()}
              className="bg-[#00B37E] hover:bg-[#009266] py-6 px-8 rounded-xl flex gap-2 items-center text-lg"
            >
              <Upload className="w-5 h-5" />
              {loading ? 'IMPORTANDO...' : 'INICIAR IMPORTAÇÃO EM MASSA'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
