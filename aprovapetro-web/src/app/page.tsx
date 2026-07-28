'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, BookOpen, BrainCircuit, Bot, User, Clock, CheckCircle2, ChevronRight, Trophy, Zap, Shield } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import Link from 'next/link';
import { motion } from 'framer-motion';

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

    const url = new URL(`https://aprovapetro.onrender.com/api/dashboard`);
    if (u.userId) url.searchParams.append('userId', u.userId);
    
    fetch(url.toString())
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [router]);

const AVATARS = [
  { id: 'avatar-1', icon: User, color: '#3ADB6E', bg: 'bg-[#3ADB6E]/20' },
  { id: 'avatar-2', icon: Bot, color: '#F5C518', bg: 'bg-[#F5C518]/20' },
  { id: 'avatar-3', icon: Zap, color: '#EF4444', bg: 'bg-[#EF4444]/20' },
  { id: 'avatar-4', icon: Shield, color: '#3B82F6', bg: 'bg-[#3B82F6]/20' },
  { id: 'avatar-5', icon: BrainCircuit, color: '#A855F7', bg: 'bg-[#A855F7]/20' },
  { id: 'avatar-6', icon: Flame, color: '#FF8A65', bg: 'bg-[#FF8A65]/20' },
];

  if (!data) return <div className="h-full bg-[#0A0F0D] flex items-center justify-center text-zinc-400">Carregando painel...</div>;

  const isCustomAvatar = data.avatarId?.startsWith('data:image/');
  const CurrentAvatar = AVATARS.find(a => a.id === (data.avatarId || 'avatar-1')) || AVATARS[0];
  const CurrentAvatarIcon = CurrentAvatar.icon;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="h-full bg-[#0A0F0D] text-white flex flex-col relative pb-20">
      
      {/* HEADER */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="px-5 py-4 flex items-center justify-between z-10 sticky top-0 bg-[#0A0F0D]/80 backdrop-blur-md relative border-b border-zinc-800/50"
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`w-10 h-10 rounded-full ${isCustomAvatar ? 'bg-zinc-800' : CurrentAvatar.bg} overflow-hidden flex items-center justify-center`}>
          {isCustomAvatar ? (
            <img src={data.avatarId} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <CurrentAvatarIcon className="w-6 h-6" style={{ color: CurrentAvatar.color }} />
          )}
        </motion.div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img src="/logo.png" alt="AprovaPETRO" className="h-14 object-contain" />
        </div>
        <motion.button 
          whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px rgba(58, 219, 110, 0.5)" }} 
          whileTap={{ scale: 0.9 }} 
          className="w-10 h-10 bg-[#3ADB6E]/10 rounded-xl flex items-center justify-center text-[#3ADB6E] transition-shadow"
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      </motion.header>

      {/* SCROLLABLE CONTENT */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto px-5 pb-8 space-y-6 pt-2"
      >
        
        {/* GREETING */}
        <motion.section variants={itemVariants}>
          <h1 className="text-2xl font-bold">Bom dia, {data.name}!</h1>
          <p className="text-zinc-400 mt-1">Faltam <span className="text-[#F5C518] font-bold">43 dias</span> para a prova.</p>
        </motion.section>

        {/* MISSÃO DIÁRIA */}
        {data.mission && (
          <motion.div variants={itemVariants}>
            <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3ADB6E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="p-5 relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-lg">Missão Diária</h3>
                  <span className="text-[#3ADB6E] text-sm font-medium">{completedTasks.length}/{data.mission.tasks.length} concluído</span>
                </div>
                <Progress value={(completedTasks.length / data.mission.tasks.length) * 100} className="h-1.5 bg-zinc-800 mb-5" indicatorClassName="bg-[#3ADB6E] shadow-[0_0_10px_#3ADB6E]" />
                
                <div className="space-y-3">
                  {data.mission.tasks.map((task: any, i: number) => {
                    const isCompleted = completedTasks.includes(i);
                    return (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        key={i} 
                        onClick={() => handleTaskClick(i, task.type)}
                        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isCompleted 
                            ? 'bg-[#3ADB6E]/10 border-[#3ADB6E]/50 shadow-[0_0_15px_rgba(58,219,110,0.15)]' 
                            : 'bg-[#0A0F0D] border-zinc-800/30 hover:border-zinc-700'
                        }`}
                      >
                        <motion.div 
                          layout
                          className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                            isCompleted ? 'bg-[#3ADB6E] border-[#3ADB6E]' : 'border-zinc-600'
                          }`}
                        >
                          {isCompleted && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 className="w-4 h-4 text-[#0A0F0D]" /></motion.div>}
                        </motion.div>
                        <span className={`text-sm transition-colors ${isCompleted ? 'text-[#3ADB6E] font-medium line-through decoration-[#3ADB6E]/50' : 'text-zinc-300'}`}>
                          {task.title}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* INDEX E STATS */}
        <motion.div variants={itemVariants}>
          <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#F5C518]/5 to-transparent" />
            <CardContent className="p-6 flex flex-col items-center relative z-10">
              <h3 className="text-sm text-zinc-400 mb-6">AprovaPETRO Index</h3>
              
              <div className="relative w-32 h-32 mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(58,219,110,0.3)]">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1A2730" strokeWidth="10" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" stroke="#3ADB6E" strokeWidth="10" 
                    strokeDasharray="282.7" 
                    initial={{ strokeDashoffset: 282.7 }}
                    animate={{ strokeDashoffset: 282.7 - (282.7 * data.indexAprovaPetro) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold tracking-tighter text-white">
                    {data.indexAprovaPetro}<span className="text-xl">%</span>
                  </span>
                  <span className="text-[10px] text-[#3ADB6E] font-bold uppercase tracking-widest mt-1 drop-shadow-md">Competitivo</span>
                </div>
              </div>

              <div className="bg-[#0A0F0D] px-4 py-2 rounded-full border border-zinc-800">
                <span className="text-[#3ADB6E] text-sm font-medium">Você está no Top 15%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SMALL STATS GRID */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <motion.div whileHover={{ y: -5 }}>
            <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A0F0D] border border-zinc-800 flex items-center justify-center text-[#3ADB6E] shadow-[0_0_15px_rgba(58,219,110,0.15)]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Total Horas</p>
                  <p className="font-bold text-lg text-white">{data.stats?.hours}h</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ y: -5 }}>
            <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A0F0D] border border-zinc-800 flex items-center justify-center text-[#F5C518] shadow-[0_0_15px_rgba(245,197,24,0.15)]">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Precisão</p>
                  <p className="font-bold text-lg text-white">{data.stats?.precision}%</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="col-span-2">
            <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A0F0D] border border-zinc-800 flex items-center justify-center text-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400 font-medium">Questões Resolvidas</p>
                  <p className="font-bold text-lg text-white">{data.stats?.totalQuestions}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* RANKING BANNER */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-[#F5C518]/20 to-transparent border border-[#F5C518]/30 rounded-2xl p-4 flex items-center justify-between mt-6 shadow-[0_0_20px_rgba(245,197,24,0.1)]"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }} 
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
              className="w-12 h-12 flex items-center justify-center text-3xl"
            >
              🏆
            </motion.div>
            <div>
              <h4 className="font-bold text-[#F5C518]">Subida de Ranking!</h4>
              <p className="text-xs text-zinc-400">Você ultrapassou 420 candidatos hoje.</p>
            </div>
          </div>
          <Button size="sm" className="bg-[#F5C518] hover:bg-[#d9a51c] text-black font-bold rounded-xl transition-transform active:scale-95">
            Ver Rank
          </Button>
        </motion.div>
        
      </motion.main>

      <BottomNav />
    </div>
  );
}
