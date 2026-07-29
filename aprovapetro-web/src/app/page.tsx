'use client';
import { apiFetch } from '@/lib/api';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Flame, Target, BookOpen, BrainCircuit, Bot, User, Clock, CheckCircle2, ChevronRight, Trophy, Zap, Shield, X } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { TopHeader } from '@/components/TopHeader';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';

export default function Home() {
  const { dashboardData, setDashboardData } = useUserStore();
  const [data, setData] = useState<any>(dashboardData);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [showRankModal, setShowRankModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [editExamDate, setEditExamDate] = useState('');
  const [isSavingDate, setIsSavingDate] = useState(false);
  const [greeting, setGreeting] = useState('Olá');
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
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Bom dia');
    else if (hour >= 12 && hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');

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
    
    apiFetch(url.toString())
      .then(res => res.json())
      .then(d => {
        setData(d);
        setDashboardData(d);
        if (d.examDate) {
          setEditExamDate(new Date(d.examDate).toISOString().split('T')[0]);
        }
      })
      .catch(console.error);
  }, [router, setDashboardData]);

  const handleSaveExamDate = async () => {
    setIsSavingDate(true);
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      const res = await apiFetch(`https://aprovapetro.onrender.com/api/users/${data.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examDate: editExamDate })
      });
      if (res.ok) {
        const url = new URL(`https://aprovapetro.onrender.com/api/dashboard`);
        if (u.userId) url.searchParams.append('userId', u.userId);
        const newData = await apiFetch(url.toString()).then(r => r.json());
        setData(newData);
        setShowDateModal(false);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar a data da prova.');
    } finally {
      setIsSavingDate(false);
    }
  };

const AVATARS = [
  { id: 'avatar-1', icon: User, color: '#3ADB6E', bg: 'bg-[#3ADB6E]/20' },
  { id: 'avatar-2', icon: Bot, color: '#F5C518', bg: 'bg-[#F5C518]/20' },
  { id: 'avatar-3', icon: Zap, color: '#EF4444', bg: 'bg-[#EF4444]/20' },
  { id: 'avatar-4', icon: Shield, color: '#3B82F6', bg: 'bg-[#3B82F6]/20' },
  { id: 'avatar-5', icon: BrainCircuit, color: '#A855F7', bg: 'bg-[#A855F7]/20' },
  { id: 'avatar-6', icon: Flame, color: '#FF8A65', bg: 'bg-[#FF8A65]/20' },
];

  if (!data) {
    return (
      <div className="h-full bg-[#0A0F0D] flex flex-col relative">
        <header className="px-5 py-4 flex items-center justify-between border-b border-zinc-800/50">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-32 h-10" />
          <Skeleton className="w-10 h-10 rounded-xl" />
        </header>
        <div className="p-5 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="col-span-2 h-24 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

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
      <TopHeader />

      {/* SCROLLABLE CONTENT */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto px-5 pb-8 pt-2"
      >
        
        {/* GREETING */}
        <motion.section variants={itemVariants} className="mb-6">
          <h1 className="text-2xl font-bold">{greeting}, {data.name}!</h1>
          <button 
            onClick={() => setShowDateModal(true)}
            className="text-left text-zinc-400 mt-1 hover:text-white transition-colors"
          >
            {data.daysToExam !== null && data.daysToExam !== undefined ? (
              data.daysToExam === 0 ? (
                <>Chegou o grande dia! A prova é <span className="text-[#F5C518] font-bold">HOJE</span>!</>
              ) : (
                <>Faltam <span className="text-[#F5C518] font-bold">{data.daysToExam} dias</span> para a prova. ✏️</>
              )
            ) : (
              <>Defina a data ou previsão da sua prova ⏳</>
            )}
          </button>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

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

          {/* RANKING BANNER (moved under Missao on desktop) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className={`border rounded-2xl p-4 flex items-center justify-between shadow-lg ${
              data.topPercent > 50 
                ? 'bg-gradient-to-r from-red-500/20 to-transparent border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                : data.topPercent <= 20
                  ? 'bg-gradient-to-r from-[#3ADB6E]/20 to-transparent border-[#3ADB6E]/30 shadow-[0_0_20px_rgba(58,219,110,0.1)]'
                  : 'bg-gradient-to-r from-[#F5C518]/20 to-transparent border-[#F5C518]/30 shadow-[0_0_20px_rgba(245,197,24,0.1)]'
            }`}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                className="w-12 h-12 flex items-center justify-center text-3xl"
              >
                {data.topPercent > 50 ? '⚠️' : data.topPercent <= 20 ? '👑' : '🏆'}
              </motion.div>
              <div>
                <h4 className={`font-bold ${
                  data.topPercent > 50 ? 'text-red-400' : data.topPercent <= 20 ? 'text-[#3ADB6E]' : 'text-[#F5C518]'
                }`}>
                  {data.topPercent > 50 ? 'Alerta de Queda!' : data.topPercent <= 20 ? 'Elite Consolidada!' : 'Subida de Ranking!'}
                </h4>
                <p className="text-xs text-zinc-400">
                  {data.topPercent > 50 
                    ? 'Você está perdendo posições. Reaja!' 
                    : data.topPercent <= 20 
                      ? 'Você está no topo da cadeia.' 
                      : 'Você ultrapassou vários candidatos.'}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowRankModal(true)} 
              size="sm" 
              className={`font-bold rounded-xl transition-transform active:scale-95 text-black ${
                data.topPercent > 50 ? 'bg-red-500 hover:bg-red-600' : data.topPercent <= 20 ? 'bg-[#3ADB6E] hover:bg-[#009266]' : 'bg-[#F5C518] hover:bg-[#d9a51c]'
              }`}
            >
              Ver Rank
            </Button>
          </motion.div>
        </div> {/* End of lg:col-span-2 column */}

        <div className="space-y-6">
          {/* INDEX E STATS */}
          <motion.div variants={itemVariants}>
          <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#F5C518]/5 to-transparent" />
            <CardContent className="p-6 flex flex-col items-center relative z-10">
              <h3 className="text-xl font-black uppercase tracking-widest mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#00A35C] via-[#3ADB6E] to-[#F5C518] drop-shadow-[0_0_15px_rgba(58,219,110,0.3)]">
                AprovaPETRO Index
              </h3>
              
              <div className="relative w-32 h-32 mb-6">
                <svg viewBox="0 0 100 100" className={`w-full h-full transform -rotate-90`} style={{ filter: `drop-shadow(0 0 10px ${data.indexStatus?.color}40)` }}>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1A2730" strokeWidth="10" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" stroke={data.indexStatus?.color || '#3ADB6E'} strokeWidth="10" 
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
                  <span style={{ color: data.indexStatus?.color || '#3ADB6E' }} className="text-[10px] font-bold uppercase tracking-widest mt-1 drop-shadow-md">
                    {data.indexStatus?.text || 'COMPETITIVO'}
                  </span>
                </div>
              </div>

              <div className="bg-[#0A0F0D] px-4 py-2 rounded-full border border-zinc-800">
                <span className="text-sm font-medium" style={{ color: data.indexStatus?.color || '#3ADB6E' }}>
                  {data.rankMessage || `Você está no Top ${data.topPercent || 100}%`}
                </span>
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
                  <p className="text-xs text-zinc-400 font-medium">Tempo de Estudo</p>
                  <p className="font-bold text-lg text-white">{data.stats?.timeFormatted || '0m'}</p>
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

        </div> {/* End of right column */}
        </div> {/* End of grid */}
      </motion.main>

      <AnimatePresence>
        {showRankModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111C22] w-full max-w-sm rounded-3xl border border-zinc-800 shadow-2xl p-6 relative overflow-hidden text-center"
            >
              <button 
                onClick={() => setShowRankModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <Trophy className="w-16 h-16 text-[#F5C518] mx-auto mb-4" />
              <h2 className="text-2xl font-black text-white mb-2 uppercase">Ranking Global</h2>
              <p className="text-zinc-400 text-sm mb-4">
                Você está no <strong className="text-[#3ADB6E]">Top {data.topPercent}%</strong> de todos os usuários do AprovaPETRO.
              </p>

              {data.topPercent > 50 && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl mb-6">
                  <p className="text-sm font-bold text-red-400">⚠️ ALERTA VERMELHO</p>
                  <p className="text-xs text-red-300 mt-1">Você está sendo engolido pela concorrência. Se a prova fosse hoje, você ficaria de fora. Está na hora de dobrar a sua carga de estudos e focar nas suas piores matérias. Acorde!</p>
                </div>
              )}
              {data.topPercent <= 50 && data.topPercent > 20 && (
                <div className="bg-[#F5C518]/10 border border-[#F5C518]/30 p-4 rounded-xl mb-6">
                  <p className="text-sm font-bold text-[#F5C518]">⚡ ZONA DE ATENÇÃO</p>
                  <p className="text-xs text-[#F5C518]/80 mt-1">Você está no caminho certo e tem chances, mas a Petrobras exige a elite. Aumente o ritmo de resolução de questões para cravar o seu nome no Diário Oficial.</p>
                </div>
              )}
              {data.topPercent <= 20 && (
                <div className="bg-[#3ADB6E]/10 border border-[#3ADB6E]/30 p-4 rounded-xl mb-6">
                  <p className="text-sm font-bold text-[#3ADB6E]">🔥 DESEMPENHO DE ELITE</p>
                  <p className="text-xs text-[#3ADB6E]/80 mt-1">Sua consistência está implacável. Você já tem o nível técnico para passar, agora é manter a máquina aquecida e a ansiedade sob controle. A vaga é sua!</p>
                </div>
              )}
              
              <div className="bg-[#0A0F0D] p-4 rounded-xl border border-zinc-800 mb-6">
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Seu XP Atual</p>
                <p className="text-2xl font-bold text-[#F5C518]">{data.xp} XP</p>
              </div>

              <Button 
                onClick={() => setShowRankModal(false)}
                className="w-full bg-[#3ADB6E] hover:bg-[#009266] text-[#0A0F0D] font-bold py-6 rounded-xl"
              >
                CONTINUAR TREINANDO
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111C22] w-full max-w-sm rounded-3xl border border-zinc-800 shadow-2xl p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setShowDateModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-wider text-center">Data da Prova 🎯</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-3 block text-center">Qual o dia ou a previsão?</label>
                  <input 
                    type="date" 
                    value={editExamDate}
                    onChange={(e) => setEditExamDate(e.target.value)}
                    className="w-full bg-[#0A0F0D] border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-[#3ADB6E] transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                <Button 
                  onClick={handleSaveExamDate}
                  disabled={isSavingDate || !editExamDate}
                  className="w-full bg-[#3ADB6E] hover:bg-[#009266] text-[#0A0F0D] font-bold py-6 rounded-xl mt-4"
                >
                  {isSavingDate ? 'SALVANDO...' : 'CONFIRMAR DATA'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
