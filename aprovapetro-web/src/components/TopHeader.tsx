'use client';

import { motion } from 'framer-motion';
import { Bot, User, BrainCircuit, Flame, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AVATARS = [
  { id: 'avatar-1', icon: User, color: '#3ADB6E', bg: 'bg-[#3ADB6E]/20' },
  { id: 'avatar-2', icon: Bot, color: '#F5C518', bg: 'bg-[#F5C518]/20' },
  { id: 'avatar-3', icon: Zap, color: '#EF4444', bg: 'bg-[#EF4444]/20' },
  { id: 'avatar-4', icon: Shield, color: '#3B82F6', bg: 'bg-[#3B82F6]/20' },
  { id: 'avatar-5', icon: BrainCircuit, color: '#A855F7', bg: 'bg-[#A855F7]/20' },
  { id: 'avatar-6', icon: Flame, color: '#FF8A65', bg: 'bg-[#FF8A65]/20' },
];

import { useUserStore } from '@/store/userStore';

export function TopHeader() {
  const { user } = useUserStore();
  const pathname = usePathname();
  
  if (pathname === '/login' || pathname === '/register' || pathname === '/onboarding') {
    return null;
  }

  const avatarId = user?.avatarId || 'avatar-1';

  const isCustomAvatar = avatarId.startsWith('data:image/');
  const CurrentAvatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  const CurrentAvatarIcon = CurrentAvatar.icon;

  return (
    <header 
      className="px-5 py-4 flex items-center justify-between z-10 sticky top-0 bg-[#0A0F0D]/80 backdrop-blur-md border-b border-zinc-800/50"
    >
      <Link href="/perfil">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`w-10 h-10 rounded-full ${isCustomAvatar ? 'bg-zinc-800' : CurrentAvatar.bg} overflow-hidden flex items-center justify-center cursor-pointer`}>
          {isCustomAvatar ? (
            <img src={avatarId} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <CurrentAvatarIcon className="w-6 h-6" style={{ color: CurrentAvatar.color }} />
          )}
        </motion.div>
      </Link>
      <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
        <img src="/logo.png" alt="AprovaPETRO" className="h-14 object-contain" />
      </Link>
      <Link href="/petra-ia">
        <motion.button 
          whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px rgba(58, 219, 110, 0.5)" }} 
          whileTap={{ scale: 0.9 }} 
          className="w-10 h-10 bg-[#3ADB6E]/10 rounded-xl flex items-center justify-center text-[#3ADB6E] transition-shadow cursor-pointer"
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      </Link>
    </header>
  );
}
