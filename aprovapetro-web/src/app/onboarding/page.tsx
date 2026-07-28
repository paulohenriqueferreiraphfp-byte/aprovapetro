'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Onboarding() {
  const [cargos, setCargos] = useState<any[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<string | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u) {
      router.push('/login');
      return;
    }
    setUser(u);

    fetch(`https://aprovapetro.onrender.com/api/cargos`)
      .then(res => res.json())
      .then(setCargos)
      .catch(console.error);
  }, [router]);

  const handleFinish = async (cargoId: string = selectedCargo as string) => {
    if (!cargoId || !user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`https://aprovapetro.onrender.com/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, cargoId })
      });
      
      if (!res.ok) {
        throw new Error('Erro na resposta do servidor');
      }

      const updatedUser = { ...user, isOnboarded: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      router.push('/');
    } catch (e) {
      console.error(e);
      alert('Tivemos um problema ao conectar com o servidor. Por favor, tente novamente!');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center p-4 text-white">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold mb-4 text-center">Qual cargo técnico você deseja focar?</h1>
        <p className="text-zinc-400 mb-10 text-center text-lg">Vamos montar seu plano de estudos diário focado nas disciplinas do seu edital.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {cargos.map(cargo => (
            <Card 
              key={cargo.id} 
              className={`cursor-pointer border-2 bg-[#18181B] hover:bg-zinc-800 transition-all ${
                selectedCargo === cargo.id ? 'border-[#00B37E] bg-[#00B37E]/10' : 'border-zinc-800'
              }`}
              onClick={() => {
                setSelectedCargo(cargo.id);
              }}
              onDoubleClick={() => handleFinish(cargo.id)}
            >
              <CardContent className="p-6">
                <h3 className={`font-bold text-xl mb-2 ${selectedCargo === cargo.id ? 'text-[#00B37E]' : 'text-white'}`}>{cargo.name}</h3>
                <p className="text-sm text-zinc-400">{cargo.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={() => handleFinish()} 
            disabled={!selectedCargo || isLoading}
            className="w-full max-w-md bg-[#00B37E] hover:bg-[#009266] py-8 text-xl font-bold rounded-xl shadow-[0_0_20px_rgba(0,179,126,0.4)] disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? 'GERANDO PLANO...' : 'GERAR MEU PLANO DE ESTUDOS'}
          </Button>
        </div>
      </div>
    </div>
  );
}
