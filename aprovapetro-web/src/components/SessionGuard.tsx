'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Não proteger rotas públicas
    if (pathname === '/login' || pathname === '/register') return;

    const checkSession = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (!stored) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(stored);
        if (!user.userId || !user.sessionId) {
          // Caso seja um usuário antigo sem sessionId, apenas força o re-login
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        const res = await fetch(`https://aprovapetro.onrender.com/api/auth/check-session?userId=${user.userId}&sessionId=${user.sessionId}`);
        const data = await res.json();

        if (!data.isValid) {
          console.warn('Sessão expirada ou acesso simultâneo detectado.');
          localStorage.removeItem('user');
          router.push('/login');
          alert('Sua sessão expirou. Outro dispositivo acessou esta conta ou seu acesso foi revogado.');
        }
      } catch (e) {
        console.error('Erro ao verificar sessão', e);
      }
    };

    // Verificar na hora que carrega a página
    checkSession();

    // E verificar periodicamente (a cada 30 segundos) se a página ficar aberta
    const interval = setInterval(checkSession, 30000);
    
    return () => clearInterval(interval);
  }, [pathname, router]);

  return null;
}
