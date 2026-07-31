'use client';
import { apiFetch } from '@/lib/api';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Save } from 'lucide-react';
import Link from 'next/link';

import { Skeleton } from '@/components/ui/skeleton';

export default function SimuladoPlayer() {
  const { id } = useParams();
  const router = useRouter();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [attemptId, setAttemptId] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);

  // Timer simulation
  const [timeLeft, setTimeLeft] = useState(() => 4 * 60 * 60); // 4 hours

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u) {
      router.push('/login');
      return;
    }

    apiFetch(`https://aprovapetro.onrender.com/api/simulados/${id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: u.userId })
    })
      .then(res => res.json())
      .then(data => {
        setAttemptId(data.attemptId);
        setQuestions(data.questions);
      })
      .catch(console.error);
  }, [id, router]);

  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const handleSelectOption = (optionIndex: number) => {
    const currentQ = questions[currentIndex].question;
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionIndex }));
  };

  const finishSimulado = async () => {
    try {
      const res = await apiFetch(`https://aprovapetro.onrender.com/api/simulados/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (showReview) {
    return (
      <div className="h-full overflow-y-auto bg-[#121214] text-white p-8">
        <header className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => setShowReview(false)} className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar ao Resumo
          </Button>
          <h1 className="text-3xl font-bold">Gabarito Comentado</h1>
        </header>

        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          {questions.map((qInfo, index) => {
            const q = qInfo.question;
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correctOption;

            return (
              <Card key={q.id} className="bg-[#18181B] border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Questão {index + 1}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${isCorrect ? 'bg-[#00B37E]/20 text-[#00B37E]' : 'bg-red-500/20 text-red-500'}`}>
                      {isCorrect ? 'ACERTOU' : 'ERROU'}
                    </span>
                  </div>
                  
                  <p className="text-zinc-300 mb-6 leading-relaxed">{q.statement}</p>
                  
                  <div className="space-y-3 mb-6">
                    {q.options.map((opt: any, optIndex: number) => {
                      const isSelected = userAnswer === opt.orderIndex;
                      const isActualCorrect = q.correctOption === opt.orderIndex;
                      
                      let borderClass = 'border-zinc-800';
                      let bgClass = 'bg-[#121214]';
                      let textClass = 'text-zinc-200';
                      const optionLabels = ['A', 'B', 'C', 'D', 'E'];
                      
                      if (isActualCorrect) {
                        borderClass = 'border-[#00B37E]';
                        bgClass = 'bg-[#00B37E]/10';
                        textClass = 'text-[#00B37E] font-bold';
                      } else if (isSelected && !isActualCorrect) {
                        borderClass = 'border-red-500';
                        bgClass = 'bg-red-500/10';
                        textClass = 'text-red-400';
                      }

                      return (
                        <div key={opt.id} className={`p-4 rounded-xl border ${borderClass} ${bgClass} ${textClass} flex gap-4`}>
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs flex-shrink-0 ${isActualCorrect ? 'bg-[#00B37E] text-black' : isSelected ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {optionLabels[optIndex]}
                          </div>
                          <div>{opt.text}</div>
                        </div>
                      );
                    })}
                  </div>

                  {!isCorrect && (
                    <div className="mb-4 p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                      <p className="text-sm font-bold text-red-400">
                        A alternativa correta é a letra <span className="text-white ml-1 bg-red-500 px-2 py-0.5 rounded">{['A','B','C','D','E'][q.correctOption]}</span>
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-xl border border-zinc-700 bg-[#0A0F0D]">
                    <h4 className="font-bold text-[#FBBF24] mb-2 flex items-center gap-2">💡 Comentário e Macete (PETRA IA):</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">{q.explanation || 'Nenhum comentário disponível para esta questão.'}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="h-screen bg-[#121214] text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-lg bg-[#18181B] border-zinc-800 text-center">
          <CardContent className="p-10 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-2">Simulado Finalizado!</h1>
            <p className="text-zinc-400 mb-8">Aqui está o seu resultado oficial</p>
            
            <div className="w-40 h-40 rounded-full border-8 flex items-center justify-center text-4xl font-bold mb-8"
                 style={{ borderColor: result.score >= 70 ? '#00B37E' : result.score >= 50 ? '#FBBF24' : '#EF4444' }}>
              {result.score}%
            </div>

            <div className="flex gap-8 mb-8 text-lg">
              <div className="text-center">
                <div className="font-bold text-[#00B37E]">{result.correctCount}</div>
                <div className="text-sm text-zinc-400">Acertos</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-500">{result.totalQuestions - result.correctCount}</div>
                <div className="text-sm text-zinc-400">Erros</div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <Button onClick={() => setShowReview(true)} className="w-full bg-[#FBBF24] hover:bg-[#d9a51c] text-black font-bold py-6">
                VER GABARITO COMENTADO
              </Button>
              <Link href="/simulados" className="w-full">
                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 py-6">Voltar aos Simulados</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="h-screen bg-[#121214] flex flex-col relative">
        <header className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-32" />
        </header>
        <div className="p-8 max-w-3xl w-full mx-auto space-y-6">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQInfo = questions[currentIndex];
  const currentQ = currentQInfo.question;
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="h-screen bg-[#121214] text-white flex flex-col">
      <header className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/simulados">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-bold">Simulado Oficial</h2>
            <p className="text-sm text-zinc-400">Questão {currentIndex + 1} de {questions.length}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 font-mono text-xl ${timeLeft < 1800 ? 'text-red-500' : 'text-[#FBBF24]'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <Button onClick={finishSimulado} className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white flex gap-2">
            <Save className="w-4 h-4" /> Finalizar Prova
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 flex justify-center">
        <div className="max-w-3xl w-full">
          <div className="text-sm text-zinc-500 mb-4">{currentQ.bank} • {currentQ.year} • {currentQ.topic?.subject?.name}</div>
          <p 
            className="text-xl mb-8 leading-relaxed whitespace-pre-wrap font-bold shrink-0"
            style={{ color: '#ffffff', minHeight: '40px' }}
          >
            {currentQ.statement || 'Erro: Enunciado não encontrado.'}
          </p>
          
          <div className="space-y-4">
            {currentQ.options.map((opt: any) => {
              const isSelected = currentAnswer === opt.orderIndex;
              const borderClass = isSelected ? 'border-[#00B37E]' : 'border-zinc-800 hover:border-zinc-600';
              const bgClass = isSelected ? 'bg-[#00B37E]/10' : 'bg-[#18181B] hover:bg-zinc-800';
              
              return (
                <Card 
                  key={opt.id} 
                  className={`cursor-pointer border-2 transition-all ${borderClass} ${bgClass}`}
                  onClick={() => handleSelectOption(opt.orderIndex)}
                >
                  <CardContent className="p-4 text-zinc-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 ${isSelected ? 'border-[#00B37E] bg-[#00B37E]' : 'border-zinc-600'}`} />
                      </div>
                      <div>{opt.text}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex justify-between gap-4">
            <Button 
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800"
            >
              ANTERIOR
            </Button>
            
            <Button 
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="bg-zinc-800 hover:bg-zinc-700 px-8"
            >
              PRÓXIMA
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
