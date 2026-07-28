'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, User, Flame, Calendar, Settings, Shield, Zap, Moon, Lock, Briefcase, X, BrainCircuit } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

const AVATARS = [
  { id: 'avatar-1', icon: User, color: '#3ADB6E', bg: 'bg-[#3ADB6E]/20' },
  { id: 'avatar-2', icon: Bot, color: '#F5C518', bg: 'bg-[#F5C518]/20' },
  { id: 'avatar-3', icon: Zap, color: '#EF4444', bg: 'bg-[#EF4444]/20' },
  { id: 'avatar-4', icon: Shield, color: '#3B82F6', bg: 'bg-[#3B82F6]/20' },
  { id: 'avatar-5', icon: BrainCircuit, color: '#A855F7', bg: 'bg-[#A855F7]/20' },
  { id: 'avatar-6', icon: Flame, color: '#FF8A65', bg: 'bg-[#FF8A65]/20' },
];

export default function PerfilPage() {
  const [data, setData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('avatar-1');
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u) {
      router.push('/login');
      return;
    }

    fetch(`https://aprovapetro.onrender.com/api/dashboard?userId=${u.userId}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setEditName(d.name);
        setEditAvatar(d.avatarId || 'avatar-1');
      })
      .catch(console.error);
  }, [router]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      
      const res = await fetch(`https://aprovapetro.onrender.com/api/users/${data.id}`, {
        method: 'POST', // Usando POST pois o nestJS tá como POST users/:id
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, avatarId: editAvatar })
      });
      
      if (res.ok) {
        // Optimistic UI Update
        setData({ ...data, name: editName, avatarId: editAvatar });
        // Update localStorage
        if (u) {
          u.name = editName;
          u.avatarId = editAvatar;
          localStorage.setItem('user', JSON.stringify(u));
        }
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar o perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!data) return <div className="h-full bg-[#0A0F0D] flex items-center justify-center text-white">Carregando Perfil...</div>;

  const xpProgress = (data.xp % 100); 
  const nextLevelXp = 100;
  
  const isCustomAvatar = data.avatarId?.startsWith('data:image/');
  const CurrentAvatar = AVATARS.find(a => a.id === (data.avatarId || 'avatar-1')) || AVATARS[0];
  const CurrentAvatarIcon = CurrentAvatar.icon;

  return (
    <div className="h-full bg-[#0A0F0D] text-white flex flex-col relative pb-20">
      
      {/* HEADER */}
      <header className="px-5 py-4 flex items-center justify-between z-10 sticky top-0 bg-[#0A0F0D]/90 backdrop-blur-sm relative border-b border-zinc-800/50">
        <div className={`w-10 h-10 rounded-full ${isCustomAvatar ? 'bg-zinc-800' : CurrentAvatar.bg} overflow-hidden flex items-center justify-center`}>
          {isCustomAvatar ? (
            <img src={data.avatarId} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <CurrentAvatarIcon className="w-6 h-6" style={{ color: CurrentAvatar.color }} />
          )}
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-b from-[#1A2730] to-[#111C22] p-6 rounded-3xl border border-zinc-800/50 relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#3ADB6E]/5 rounded-full blur-3xl" />
          
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex gap-4 items-center">
              <motion.div 
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsEditing(true)}
                className={`w-16 h-16 rounded-2xl ${isCustomAvatar ? 'bg-zinc-800' : CurrentAvatar.bg} flex items-center justify-center shadow-lg cursor-pointer border border-white/5 overflow-hidden`}
              >
                {isCustomAvatar ? (
                  <img src={data.avatarId} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <CurrentAvatarIcon className="w-8 h-8" style={{ color: CurrentAvatar.color }} />
                )}
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">{data.name}</h1>
                <p className="text-[#3ADB6E] text-sm mt-1 font-medium">{data.cargoName}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 relative z-10 mt-6">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-zinc-400 font-bold tracking-widest uppercase">Level {data.level}</span>
              <span className="text-[#F5C518] font-bold">{xpProgress} / {nextLevelXp} XP</span>
            </div>
            <Progress value={(xpProgress / nextLevelXp) * 100} className="h-2 bg-[#0A0F0D]" indicatorClassName="bg-[#F5C518] shadow-[0_0_10px_#F5C518]" />
          </div>

          <div className="flex gap-3 relative z-10">
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline" 
              className="flex-1 bg-[#0A0F0D] border-zinc-700 hover:bg-[#111C22] text-zinc-300 transition-all active:scale-95"
            >
              <Settings className="w-4 h-4 mr-2 text-[#3ADB6E]" /> Editar Perfil
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" className="flex-1 bg-[#0A0F0D] border-zinc-700 hover:bg-[#111C22] text-zinc-300 transition-all active:scale-95">
              <Calendar className="w-4 h-4 mr-2 text-[#F5C518]" /> 
              {data.daysToExam !== null && data.daysToExam !== undefined 
                ? (data.daysToExam === 0 ? 'Exame: HOJE' : `Faltam ${data.daysToExam} dias`) 
                : 'Definir Data'}
            </Button>
          </div>
        </motion.div>

        {/* OFENSIVA ATUAL */}
        <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl text-center py-6">
          <CardContent className="p-0 flex flex-col items-center">
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-4">Ofensiva Atual</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-6xl font-bold text-[#F5C518]">{data.streak}</span>
              <span className="text-5xl drop-shadow-[0_0_15px_rgba(245,197,24,0.5)]">🔥</span>
            </div>
            <p className="text-sm text-zinc-400">Você estudou {data.streak} dias seguidos!</p>
          </CardContent>
        </Card>

      </main>
      <BottomNav />

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditing && (
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
              className="bg-[#111C22] w-full max-w-sm rounded-3xl border border-zinc-800 shadow-2xl p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-xl font-bold mb-6 text-white">Editar Perfil</h2>

              <div className="space-y-6">
                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-3 block">Nome de Agente</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#0A0F0D] border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-[#3ADB6E] transition-colors"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-3 block">Escolha seu Avatar ou Envie uma Foto</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {AVATARS.map(avatar => {
                      const Icon = avatar.icon;
                      const isSelected = editAvatar === avatar.id;
                      return (
                        <motion.button
                          key={avatar.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditAvatar(avatar.id)}
                          className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all ${
                            isSelected 
                              ? `${avatar.bg} border-2 border-[${avatar.color}] shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
                              : 'bg-[#0A0F0D] border border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <Icon className="w-8 h-8" style={{ color: avatar.color }} />
                        </motion.button>
                      );
                    })}
                  </div>
                  
                  <div className="relative w-full h-12">
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="upload-photo"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 128;
                            const MAX_HEIGHT = 128;
                            
                            let width = img.width;
                            let height = img.height;
                            
                            if (width > height) {
                              if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                              }
                            } else {
                              if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                              }
                            }
                            
                            canvas.width = width;
                            canvas.height = height;
                            
                            const ctx = canvas.getContext('2d');
                            ctx?.drawImage(img, 0, 0, width, height);
                            
                            // Compress heavily to keep payload small
                            const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                            setEditAvatar(dataUrl);
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <div className="w-full h-full bg-[#0A0F0D] border border-zinc-700 rounded-xl flex items-center justify-center text-sm font-bold text-zinc-300 hover:bg-[#111C22] transition-colors">
                      {editAvatar.startsWith('data:image/') ? 'FOTO CARREGADA ✔️' : '📸 ENVIAR MINHA FOTO'}
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving || !editName.trim()}
                  className="w-full bg-[#3ADB6E] hover:bg-[#009266] text-[#0A0F0D] font-bold py-6 rounded-xl mt-4"
                >
                  {isSaving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
