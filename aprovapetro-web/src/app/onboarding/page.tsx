'use client';
import { apiFetch } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Onboarding() {
  const [cargos, setCargos] = useState<any[]>([]);
  const [step, setStep] = useState<number>(1);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
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

    apiFetch(`https://aprovapetro.onrender.com/api/cargos`)
      .then(res => res.json())
      .then(setCargos)
      .catch(console.error);
  }, [router]);

  const handleFinish = async (cargoId: string = selectedCargo as string) => {
    if (!cargoId || !user) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`https://aprovapetro.onrender.com/api/onboarding`, {
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

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setStep(2);
  };

  if (isLoading) {
    return (
      <div className="h-full bg-[#121214] flex flex-col items-center justify-center p-4 text-white">
        <div className="animate-spin w-16 h-16 border-4 border-[#00B37E] border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-2xl font-bold text-[#00B37E] animate-pulse">Gerando seu Plano de Estudos...</h2>
        <p className="text-zinc-400 mt-2">Isso pode levar alguns segundos.</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#121214] flex flex-col items-center p-4 text-white overflow-y-auto py-10">
      <div className="max-w-3xl w-full">
        {step === 1 && (
          <div className="animate-in fade-in zoom-in duration-300">
            <h1 className="text-4xl font-bold mb-4 text-center">Qual o nível da sua prova?</h1>
            <p className="text-zinc-400 mb-10 text-center text-lg">Selecione a escolaridade do cargo que você deseja prestar.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer border-2 border-zinc-800 bg-[#18181B] hover:border-[#00B37E] hover:bg-[#00B37E]/5 transition-all text-center py-10"
                onClick={() => handleLevelSelect('TÉCNICO')}
              >
                <CardContent className="p-6">
                  <h2 className="text-3xl font-bold text-[#00B37E] mb-2">Nível Técnico</h2>
                  <p className="text-zinc-400">Técnicos de Operação, Segurança, Eletrotécnica, Mecânica, etc.</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer border-2 border-zinc-800 bg-[#18181B] hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-all text-center py-10"
                onClick={() => handleLevelSelect('SUPERIOR')}
              >
                <CardContent className="p-6">
                  <h2 className="text-3xl font-bold text-[#F59E0B] mb-2">Nível Superior</h2>
                  <p className="text-zinc-400">Engenharias, Administração, Geologia, etc.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="mb-6 flex items-center">
              <Button variant="ghost" onClick={() => setStep(1)} className="text-zinc-400 hover:text-white mr-4">
                ← Voltar
              </Button>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 text-center">Qual cargo técnico você deseja focar?</h1>
            <p className="text-zinc-400 mb-10 text-center text-lg">Vamos montar seu plano de estudos focado no seu edital.</p>

            <div className="grid grid-cols-1 gap-4 mb-10">
              {cargos.filter(c => c.level === selectedLevel).map(cargo => (
                <Card 
                  key={cargo.id} 
                  className={`cursor-pointer border-2 bg-[#18181B] hover:bg-zinc-800 transition-all ${
                    selectedCargo === cargo.id 
                      ? (selectedLevel === 'TÉCNICO' ? 'border-[#00B37E] bg-[#00B37E]/10' : 'border-[#F59E0B] bg-[#F59E0B]/10') 
                      : 'border-zinc-800'
                  }`}
                  onClick={() => setSelectedCargo(cargo.id)}
                  onDoubleClick={() => handleFinish(cargo.id)}
                >
                  <CardContent className="p-6">
                    <h3 className={`font-bold text-xl mb-2 ${
                      selectedCargo === cargo.id 
                        ? (selectedLevel === 'TÉCNICO' ? 'text-[#00B37E]' : 'text-[#F59E0B]') 
                        : 'text-white'
                    }`}>{cargo.name}</h3>
                    <p className="text-sm text-zinc-400">{cargo.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pb-10">
              <Button 
                onClick={() => handleFinish()} 
                disabled={!selectedCargo || isLoading}
                className={`w-full max-w-md py-8 text-xl font-bold rounded-xl disabled:opacity-50 disabled:shadow-none transition-all ${
                  selectedLevel === 'TÉCNICO' 
                    ? 'bg-[#00B37E] hover:bg-[#009266] shadow-[0_0_20px_rgba(0,179,126,0.4)]' 
                    : 'bg-[#F59E0B] hover:bg-[#D97706] shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                }`}
              >
                GERAR MEU PLANO DE ESTUDOS
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
