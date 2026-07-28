'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, User, Flame, Calendar, Settings, Shield, Zap, Moon, Lock, Briefcase } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Progress } from '@/components/ui/progress';

export default function PerfilPage() {
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u) {
      router.push('/login');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard?userId=${u.userId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [router]);

  if (!data) return <div className="h-full bg-[#0A0F0D] flex items-center justify-center text-white">Carregando Perfil...</div>;

  const xpProgress = (data.xp % 100); // 100 XP per level
  const nextLevelXp = 100;

  return (
    <div className="h-full bg-[#0A0F0D] text-white flex flex-col relative pb-20">
      
      {/* HEADER */}
      <header className="px-5 py-4 flex items-center justify-between z-10 sticky top-0 bg-[#0A0F0D]/90 backdrop-blur-sm relative border-b border-zinc-800/50">
        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
          <User className="w-6 h-6 text-zinc-400" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img src="/logo.png" alt="AprovaPETRO" className="h-14 object-contain" />
        </div>
        <button className="w-10 h-10 bg-[#3ADB6E]/10 rounded-xl flex items-center justify-center text-[#3ADB6E]">
          <Bot className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 space-y-6 pt-2">
        
        {/* PROFILE HEADER */}
        <div className="bg-gradient-to-b from-[#1A2730] to-[#111C22] p-6 rounded-3xl border border-zinc-800/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Engenheiro Sênior</h1>
              <p className="text-zinc-400 text-sm mt-1">{data.name}</p>
            </div>
            <div className="bg-[#F5C518] text-black px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap">
              LEVEL {data.level}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-zinc-400">Progresso XP</span>
              <span className="text-[#3ADB6E] font-bold">{xpProgress} / {nextLevelXp} XP</span>
            </div>
            <Progress value={(xpProgress / nextLevelXp) * 100} className="h-2 bg-[#0A0F0D]" indicatorClassName="bg-[#3ADB6E]" />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 bg-[#0A0F0D] border-zinc-700 hover:bg-[#111C22] text-zinc-300">
              <Settings className="w-4 h-4 mr-2 text-[#3ADB6E]" /> Editar Perfil
            </Button>
            <Button variant="outline" className="flex-1 bg-[#0A0F0D] border-zinc-700 hover:bg-[#111C22] text-zinc-300">
              <Calendar className="w-4 h-4 mr-2 text-[#F5C518]" /> Exame: 24 Set
            </Button>
          </div>
        </div>

        {/* PLANO VIP / CHECKOUT */}
        <Card className="bg-gradient-to-r from-[#F5C518]/20 to-[#F5C518]/5 border-[#F5C518]/30 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C518]/10 blur-3xl rounded-full" />
          <CardContent className="p-5 flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs text-[#F5C518] font-bold uppercase tracking-widest mb-1">Acesso Limitado</p>
              <h3 className="font-bold text-lg text-white">Plano Básico</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">Desbloqueie simulados infinitos e a Petra IA.</p>
            </div>
            <Button 
              className="bg-[#F5C518] hover:bg-[#F5C518]/90 text-black font-bold whitespace-nowrap shadow-[0_0_20px_rgba(245,197,24,0.3)]"
              onClick={async () => {
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/checkout/create-preference`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ planId: 'vip_mensal', userId: data.id })
                  });
                  const json = await res.json();
                  if (json.success && json.init_point) {
                    // Redireciona o usuário para o ambiente blindado do Mercado Pago
                    window.location.href = json.init_point;
                  } else {
                    alert('Erro ao iniciar pagamento seguro.');
                  }
                } catch (e) {
                  alert('Erro de conexão com Checkout.');
                }
              }}
            >
              Assinar VIP
            </Button>
          </CardContent>
        </Card>

        {/* OFENSIVA ATUAL */}
        <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl text-center py-6">
          <CardContent className="p-0 flex flex-col items-center">
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-4">Ofensiva Atual</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-6xl font-bold text-[#F5C518]">{data.streak}</span>
              <span className="text-5xl">🔥</span>
            </div>
            <p className="text-sm text-zinc-400">Você estudou {data.streak} dias seguidos!</p>
          </CardContent>
        </Card>

        {/* HISTÓRICO DE ESTUDOS */}
        <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Histórico de Estudos</span>
            <span className="text-sm font-bold text-[#3ADB6E]">Agosto 2024</span>
          </CardContent>
        </Card>

        {/* CONQUISTAS */}
        <section className="pt-2">
          <h3 className="font-bold text-xl mb-4">Conquistas</h3>
          <div className="grid grid-cols-2 gap-4">
            
            <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl text-center">
              <CardContent className="p-5 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-[#00B37E]/20 rounded-full flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-[#00B37E]" />
                </div>
                <h4 className="font-bold text-sm">7-Day Streak</h4>
                <p className="text-xs text-zinc-400 mt-1">Comprometimento</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl text-center">
              <CardContent className="p-5 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-[#F5C518]/20 rounded-full flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-[#F5C518]" />
                </div>
                <h4 className="font-bold text-sm">Safety Master</h4>
                <p className="text-xs text-zinc-400 mt-1">Expert em NR-10</p>
              </CardContent>
            </Card>

            <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl text-center opacity-70">
              <CardContent className="p-5 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                  <Moon className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="font-bold text-sm text-zinc-300">Night Owl</h4>
                <p className="text-xs text-zinc-500 mt-1">Estudos Noturnos</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1A2730]/50 border-zinc-800/30 rounded-2xl text-center">
              <CardContent className="p-5 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6 text-zinc-600" />
                </div>
                <h4 className="font-bold text-sm text-zinc-500">Simulado 100%</h4>
                <p className="text-xs text-zinc-600 mt-1">Bloqueado</p>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* CONFIGURAÇÕES DE CARREIRA */}
        <section className="pt-4">
          <h3 className="font-bold text-xl mb-4">Configurações de Carreira</h3>
          <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-5 border-b border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-[#3ADB6E]" />
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Cargo Pretendido</p>
                    <p className="font-bold">Engenheiro de Petróleo</p>
                  </div>
                </div>
                <button className="text-xs text-[#3ADB6E] font-medium hover:underline">Alterar</button>
              </div>

              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#F5C518]" />
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Data da Prova</p>
                    <p className="font-bold">24 de Setembro, 2024</p>
                  </div>
                </div>
                <button className="text-xs text-[#3ADB6E] font-medium hover:underline">Alterar</button>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>
      <BottomNav />
    </div>
  );
}
