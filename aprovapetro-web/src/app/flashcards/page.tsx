'use client';
import { apiFetch } from '@/lib/api';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FlashcardsPage() {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  const [cards, setCards] = useState<{q: string, a: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`https://aprovapetro.onrender.com/api/questions`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          // Embaralhar e pegar as 10 primeiras para os flashcards
          const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10);
          const mappedCards = shuffled.map((item: any) => {
            const correta = item.options?.find((opt: any) => opt.orderIndex === item.correctOption);
            return {
              q: item.statement || "Questão sem enunciado",
              a: correta ? correta.text : "Resposta correta não encontrada."
            };
          });
          setCards(mappedCards);
        } else {
          // Fallback se não houver questões no banco
          setCards([
            { q: "Qual a NR que trata sobre Segurança em Instalações e Serviços em Eletricidade?", a: "NR-10" },
            { q: "O que é LTCAT?", a: "Laudo Técnico das Condições Ambientais de Trabalho, documento que evidencia a exposição a agentes nocivos." },
            { q: "Na termodinâmica, o que diz a Primeira Lei?", a: "A energia não pode ser criada nem destruída, apenas transformada (Conservação de Energia)." }
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setCards([
          { q: "Erro ao carregar do servidor.", a: "Tente novamente mais tarde." }
        ]);
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    setFlipped(false);
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-[#0A0F0D] text-white flex items-center justify-center">
        <p className="text-zinc-400 font-bold animate-pulse">Gerando seus Flashcards...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0A0F0D] text-white flex flex-col pb-6">
      <header className="px-5 py-4 flex items-center gap-4 bg-[#111C22] border-b border-zinc-800">
        <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center bg-[#0A0F0D] rounded-full text-zinc-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold">Revisão: Flashcards</h1>
      </header>

      <main className="flex-1 px-5 flex flex-col justify-center items-center">
        <div className="w-full text-center mb-6">
          <p className="text-sm text-zinc-400 font-bold tracking-widest uppercase mb-2">Cartão {currentIdx + 1} de {cards.length}</p>
          <Progress value={((currentIdx) / cards.length) * 100} />
        </div>

        <Card 
          className="w-full aspect-[4/5] bg-gradient-to-br from-[#111C22] to-[#1A2730] border-zinc-700 cursor-pointer relative perspective-1000"
          onClick={() => setFlipped(!flipped)}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
            {!flipped ? (
              <>
                <BrainCircuit className="w-12 h-12 text-[#F5C518] mb-6" />
                <h3 className="text-xl font-bold">{cards[currentIdx].q}</h3>
                <p className="text-zinc-500 text-sm mt-8 absolute bottom-6">Toque para revelar</p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-[#3ADB6E] mb-6">Resposta:</h3>
                <p className="text-lg leading-relaxed text-zinc-200">{cards[currentIdx].a}</p>
              </>
            )}
          </CardContent>
        </Card>

        {flipped && (
          <div className="w-full flex gap-4 mt-8 animate-in slide-in-from-bottom-4">
            <Button onClick={handleNext} className="flex-1 bg-[#EF4444] hover:bg-red-600 text-white font-bold h-14 rounded-2xl">
              Errei
            </Button>
            <Button onClick={handleNext} className="flex-1 bg-[#3ADB6E] hover:bg-green-500 text-black font-bold h-14 rounded-2xl">
              Acertei
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full bg-[#F5C518] transition-all duration-300" style={{ width: `${value}%` }} />
    </div>
  );
}
