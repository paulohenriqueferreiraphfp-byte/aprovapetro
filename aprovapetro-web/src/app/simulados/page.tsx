'use client';
import { apiFetch } from '@/lib/api';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, User, Clock, FileText } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { TopHeader } from '@/components/TopHeader';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import { Skeleton } from '@/components/ui/skeleton';

export default function SimuladosList() {
  const { simuladosData, setSimuladosData } = useUserStore();
  const [simulados, setSimulados] = useState<any[]>(simuladosData || []);
  const router = useRouter();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u) {
      router.push('/login');
      return;
    }

    apiFetch(`https://aprovapetro.onrender.com/api/simulados`)
      .then(res => res.json())
      .then(data => {
        setSimulados(data);
        setSimuladosData(data);
      })
      .catch(console.error);
  }, [router, setSimuladosData]);

  return (
    <div className="h-full bg-[#0A0F0D] text-white flex flex-col relative pb-20">
      
      <TopHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 pb-8 space-y-6 pt-2">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Simulados Oficiais</h1>
          <p className="text-zinc-400 text-sm mt-1">Teste seus conhecimentos em condições reais.</p>
        </header>

        <div className="space-y-4">
          {!simuladosData && simulados.length === 0 && (
            <>
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </>
          )}
          {simulados.map(simulado => (
            <Card key={simulado.id} className="bg-[#111C22] border-zinc-800/50 rounded-2xl flex flex-col">
              <CardContent className="p-5">
                <h3 className="text-lg font-bold text-[#3ADB6E] mb-2">{simulado.title}</h3>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{simulado.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-bold text-zinc-300 mb-6 bg-[#0A0F0D] p-3 rounded-xl border border-zinc-800/30 w-fit">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#F5C518]" />
                    <span>{simulado._count?.questions || 0} questões</span>
                  </div>
                  <div className="w-px h-4 bg-zinc-700" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#3ADB6E]" />
                    <span>{simulado.durationMin / 60} horas</span>
                  </div>
                </div>
                
                <Link href={`/simulados/${simulado.id}`}>
                  <Button className="w-full bg-[#00A35C] hover:bg-[#3ADB6E] text-white py-6 font-bold rounded-xl text-md">
                    INICIAR SIMULADO
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
