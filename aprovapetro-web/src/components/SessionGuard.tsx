'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserStore } from '@/store/userStore';

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
