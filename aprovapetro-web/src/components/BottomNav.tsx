'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, HelpCircle, Zap, ClipboardList, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/questoes', icon: HelpCircle, label: 'Questões' },
    { href: '/missao', icon: Zap, label: 'Missão' },
    { href: '/simulados', icon: ClipboardList, label: 'Simulados' },
    { href: '/perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#111C22] border-t border-zinc-800/50 flex items-center justify-around px-2 z-50">
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
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isActive ? 'bg-[#3ADB6E]/10' : 'bg-transparent'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
