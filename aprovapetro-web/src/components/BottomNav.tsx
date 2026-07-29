'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Zap, ClipboardList, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/acervo', icon: Library, label: 'Acervo' },
    { href: '/missao', icon: Zap, label: 'Missão' },
    { href: '/simulados', icon: ClipboardList, label: 'Simulados' },
    { href: '/perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0A0F0D]/90 backdrop-blur-xl border-t border-zinc-800/80 flex items-center justify-around px-2 z-50 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-200 ${
              isActive ? 'text-[#3ADB6E]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="relative flex items-center justify-center w-12 h-12">
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-[#3ADB6E]/20 rounded-full shadow-[0_0_15px_rgba(58,219,110,0.4)]" 
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                />
              )}
              <motion.div
                animate={isActive ? { y: -3, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative z-10"
              >
                <Icon className="w-6 h-6" />
              </motion.div>
            </div>
            <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[#3ADB6E]' : 'text-transparent'}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

