'use client';

import { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Olá! Sou a PETRA IA, sua tutora de aprovação. Como posso te ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const currentInput = input;
    setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
    setInput('');
    
    try {
      const res = await fetch(`https://aprovapetro.onrender.com/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Desculpe, estou com problemas de conexão no momento.' }]);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#3ADB6E] rounded-full flex items-center justify-center text-[#0A0F0D] shadow-lg shadow-[#3ADB6E]/20 z-50 transition-transform hover:scale-110 active:scale-95"
      >
        <Bot className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0F0D] animate-in slide-in-from-bottom-full duration-300">
      <header className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#111C22]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3ADB6E]/20 rounded-full flex items-center justify-center text-[#3ADB6E]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-white">PETRA IA</h2>
            <p className="text-xs text-[#3ADB6E]">Online</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white p-2">
          <X className="w-6 h-6" />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#3ADB6E] text-[#0A0F0D] rounded-br-none' : 'bg-[#1A2730] text-zinc-200 rounded-bl-none'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </main>

      <footer className="p-4 border-t border-zinc-800 bg-[#111C22] flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte sobre NR-10..."
          className="flex-1 bg-[#0A0F0D] border border-zinc-700 rounded-full px-4 text-sm focus:outline-none focus:border-[#3ADB6E] text-white"
        />
        <Button onClick={handleSend} className="w-12 h-12 rounded-full bg-[#3ADB6E] text-[#0A0F0D] p-0 flex items-center justify-center">
          <Send className="w-5 h-5" />
        </Button>
      </footer>
    </div>
  );
}
