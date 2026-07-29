'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { apiFetch } from '@/lib/api';

export function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, logout } = useUserStore();

  useEffect(() => {
    if (pathname === '/login' || pathname === '/register') return;

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (!user) {
          setUser(u);
        }

        // Sincronizar e validar sessão com o servidor
        apiFetch('https://aprovapetro.onrender.com/api/auth/check-session')
          .then(res => res.json())
          .then(data => {
            if (data.valid === false) {
              alert('Sua sessão expirou ou você acessou de outro dispositivo. Faça login novamente.');
              logout();
              router.push('/login');
            } else if (data.valid === true) {
              // Sincroniza foto e nome se mudou em outro lugar
              if (data.avatarId !== u.avatarId || data.name !== u.name) {
                const updatedUser = { ...u, avatarId: data.avatarId, name: data.name };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
              }
            }
          })
          .catch(e => {
            console.error('Erro ao verificar sessão', e);
          });

      } catch (e) {
        logout();
        router.push('/login');
      }
    } else {
      logout();
      router.push('/login');
    }
  }, [router, pathname, user, setUser, logout]);

  return null;
}
