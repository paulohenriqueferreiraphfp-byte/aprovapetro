'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, User, Zap, Library, LogOut } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useUserStore();
  
  if (pathname === '/login' || pathname === '/register' || pathname === '/onboarding') return null;

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/acervo', icon: Library, label: 'Acervo' },
    { href: '/missao', icon: Zap, label: 'Missão' },
    { href: '/simulados', icon: ClipboardList, label: 'Simulados' },
    { href: '/perfil', icon: User, label: 'Perfil' },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0A0F0D] border-r border-zinc-800/80 h-screen sticky top-0">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
          Aprova<span className="text-[#3ADB6E]">PETRO</span>
        </h1>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                isActive 
                ? 'bg-[#3ADB6E]/10 text-[#3ADB6E]' 
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`font-bold ${isActive ? 'text-[#3ADB6E]' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {user && (
        <div className="p-4 border-t border-zinc-800/80">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl transition-all text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="w-5 h-5" strokeWidth={2} />
            <span className="font-bold">Sair</span>
          </button>
        </div>
      )}
    </aside>
  );
}
