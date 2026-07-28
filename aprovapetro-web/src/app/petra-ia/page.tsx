'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Send, User } from 'lucide-react';
import Link from 'next/link';

export default function PetraIA() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Olá! Sou a PETRA IA, sua tutora especializada em concursos da Petrobras. Como posso te ajudar hoje? (Ex: "Como estudar NR-10?", "O que mais cai em termodinâmica?")' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: 'Ótima pergunta! Para o edital da Petrobras/Transpetro, o ideal é focar na resolução exaustiva de questões da banca Cesgranrio. Recomendo que você acesse a aba "Simulados" e tente resolver provas inteiras para medir seu tempo e treinar sua resistência mental. Lembre-se: repetição leva à aprovação!' 
      }]);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-[#121214] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#18181B] border-r border-zinc-800 p-6 flex flex-col gap-6">
        <img src="/logo.png" alt="AprovaPETRO" className="h-8 object-contain self-start" />
        <nav className="flex flex-col gap-2">
          <Link href="/" className="px-4 py-2 hover:bg-zinc-800 rounded-md text-sm font-medium text-zinc-400">Dashboard</Link>
          <Link href="/questoes" className="px-4 py-2 hover:bg-zinc-800 rounded-md text-sm font-medium text-zinc-400">Todas as Questões</Link>
          <Link href="/simulados" className="px-4 py-2 hover:bg-zinc-800 rounded-md text-sm font-medium text-zinc-400">Simulados</Link>
          <Link href="/petra-ia" className="px-4 py-2 bg-zinc-800 rounded-md text-sm font-medium">PETRA IA</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-8">
        <header className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00B37E]/20 text-[#00B37E] rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">PETRA IA</h1>
            <p className="text-zinc-400 mt-1">Sua Tutora Inteligente 24h</p>
          </div>
        </header>

        <Card className="flex-1 bg-[#18181B] border-zinc-800 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-700' : 'bg-[#00B37E]'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-zinc-800 rounded-tr-none' : 'bg-[#00B37E]/10 border border-[#00B37E]/20 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </CardContent>
          
          <div className="p-4 border-t border-zinc-800 bg-[#121214] flex gap-4">
            <input 
              type="text" 
              placeholder="Pergunte sobre matérias, editais ou peça um resumo..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-[#00B37E]"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} className="bg-[#00B37E] hover:bg-[#009266] w-14 h-12 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
