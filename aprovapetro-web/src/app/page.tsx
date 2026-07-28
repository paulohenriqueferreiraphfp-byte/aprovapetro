'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, BookOpen, BrainCircuit, Bot, User, Clock, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import Link from 'next/link';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const router = useRouter();

  const handleTaskClick = (index: number, type: string) => {
    if (completedTasks.includes(index)) {
      setCompletedTasks(prev => prev.filter(i => i !== index));
      return;
    }
    
    // Optimistic update
    setCompletedTasks(prev => [...prev, index]);
    
    // Redirect based on type
    setTimeout(() => {
      if (type === 'questions') {
        router.push('/questoes');
      } else if (type === 'flashcards') {
        router.push('/flashcards');
      }
    }, 400);
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u) {
      router.push('/login');
      return;
    }
    if (!u.isOnboarded) {
      router.push('/onboarding');
      return;
    }

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard`);
    if (u.userId) url.searchParams.append('userId', u.userId);
    
    fetch(url.toString())
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [router]);

  // Mocked data for UI visual completion based on requirements
  const user = { name: 'Carlos' };
  const stats = {
    streak: 7,
    daysRemaining: 43,
    hours: 124,
    precision: 82,
    totalQuestions: 1240,
    index: 76,
    missionsCompleted: 0,
    missionsTotal: 3,
  };

  if (!data) return <div className="h-full bg-[#0A0F0D] flex items-center justify-center text-zinc-400">Carregando painel...</div>;

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

      {/* SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto px-5 pb-8 space-y-6 pt-2">
        
        {/* GREETING */}
        <section>
          <h1 className="text-2xl font-bold">Bom dia, {data.name}!</h1>
          <p className="text-zinc-400 mt-1">Faltam <span className="text-[#F5C518] font-bold">43 dias</span> para a prova.</p>
        </section>

        {/* MISSÃO DIÁRIA */}
        {data.mission && (
          <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">Missão Diária</h3>
                <span className="text-[#3ADB6E] text-sm font-medium">{completedTasks.length}/{data.mission.tasks.length} concluído</span>
              </div>
              <Progress value={(completedTasks.length / data.mission.tasks.length) * 100} className="h-1.5 bg-zinc-800 mb-5" indicatorClassName="bg-[#3ADB6E]" />
              
              <div className="space-y-3">
                {data.mission.tasks.map((task: any, i: number) => {
                  const isCompleted = completedTasks.includes(i);
                  return (
                    <button 
                      key={i} 
                      onClick={() => handleTaskClick(i, task.type)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-[0.98] ${
                        isCompleted 
                          ? 'bg-[#3ADB6E]/10 border-[#3ADB6E]/50' 
                          : 'bg-[#0A0F0D] border-zinc-800/30 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isCompleted ? 'bg-[#3ADB6E] border-[#3ADB6E]' : 'border-zinc-600'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-[#0A0F0D]" />}
                      </div>
                      <span className={`text-sm transition-colors ${isCompleted ? 'text-[#3ADB6E] font-medium line-through decoration-[#3ADB6E]/50' : 'text-zinc-300'}`}>
                        {task.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* INDEX E STATS */}
        <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl">
          <CardContent className="p-6 flex flex-col items-center">
            <h3 className="text-sm text-zinc-400 mb-6">AprovaPETRO Index</h3>
            
            <div className="relative w-32 h-32 mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1A2730" strokeWidth="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#F5C518" strokeWidth="10" strokeDasharray="282.7" strokeDashoffset="67.8" className="transition-all duration-1000 ease-out" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#3ADB6E" strokeWidth="10" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * data.indexAprovaPetro) / 100} className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold tracking-tighter text-white">{data.indexAprovaPetro}<span className="text-xl">%</span></span>
                <span className="text-[10px] text-[#F5C518] font-bold uppercase tracking-widest mt-1">Competitivo</span>
              </div>
            </div>

            <div className="bg-[#0A0F0D] px-4 py-2 rounded-full border border-zinc-800">
              <span className="text-[#3ADB6E] text-sm font-medium">Você está no Top 15%</span>
            </div>
          </CardContent>
        </Card>

        {/* SMALL STATS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A0F0D] border border-zinc-800 flex items-center justify-center text-[#3ADB6E]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Total Horas</p>
                <p className="font-bold text-lg text-white">{data.stats?.hours}h</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A0F0D] border border-zinc-800 flex items-center justify-center text-[#F5C518]">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Precisão</p>
                <p className="font-bold text-lg text-white">{data.stats?.precision}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl col-span-2">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A0F0D] border border-zinc-800 flex items-center justify-center text-[#EF4444]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Questões Resolvidas</p>
                <p className="font-bold text-lg text-white">{data.stats?.totalQuestions}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DESEMPENHO POR DISCIPLINA */}
        <section className="pt-2">
          <h3 className="font-bold text-lg mb-4">Desempenho por Disciplina</h3>
          
          <div className="space-y-5">
            {data.topSubjects?.map((sub: any, i: number) => (
              <Link href="/simulados" key={i} className="block group">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-300 group-hover:text-white transition-colors">{sub.name}</span>
                  <span className="font-medium" style={{ color: sub.color }}>{sub.status} • {sub.percentage}%</span>
                </div>
                <Progress value={sub.percentage} className="h-1.5 bg-[#0A0F0D]" indicatorClassName={`bg-[${sub.color}]`} />
              </Link>
            ))}
          </div>
        </section>

        {/* RANKING BANNER */}
        <div className="bg-gradient-to-r from-[#F5C518]/20 to-transparent border border-[#F5C518]/30 rounded-2xl p-4 flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center text-3xl">🏆</div>
            <div>
              <h4 className="font-bold text-[#F5C518]">Subida de Ranking!</h4>
              <p className="text-xs text-zinc-400">Você ultrapassou 420 candidatos hoje.</p>
            </div>
          </div>
          <Button size="sm" className="bg-[#F5C518] hover:bg-[#d9a51c] text-black font-bold rounded-xl">
            Ver Rank
          </Button>
        </div>
        
      </main>

      <BottomNav />
    </div>
  );
}
