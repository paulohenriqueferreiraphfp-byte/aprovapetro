'use client';
import { apiFetch } from '@/lib/api';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, User, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { TopHeader } from '@/components/TopHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuestionsPlayer() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(() => Date.now());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subjectId = params.get('subjectId');
    const url = subjectId ? `https://aprovapetro.onrender.com/api/questions?subjectId=${subjectId}` : `https://aprovapetro.onrender.com/api/questions`;
    
    apiFetch(url)
      .then(res => res.json())
      .then(d => {
        setQuestions(d);
        setStartTime(Date.now());
      })
      .catch(console.error);
  }, []);

  const handleAnswer = async () => {
    if (selectedOption === null) return;
    const currentQ = questions[currentIndex];
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    const timeSpentMs = Date.now() - startTime;
    
    try {
      const res = await apiFetch(`https://aprovapetro.onrender.com/api/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: u.userId,
          questionId: currentQ.id,
          optionIndex: selectedOption,
          timeSpentMs,
        })
      });
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error(err);
    }
  };

  const nextQuestion = () => {
    setFeedback(null);
    setSelectedOption(null);
    setStartTime(Date.now());
    setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
  };

  if (questions.length === 0) {
    return (
      <div className="h-full bg-[#0A0F0D] flex flex-col relative pb-20">
        <TopHeader />
        <div className="p-5 space-y-6">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="h-full bg-[#0A0F0D] text-white flex flex-col relative pb-20">
      
      <TopHeader />

      <main className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col">
        
        {/* SUBJECT INFO */}
        <div className="flex justify-between items-start mb-6 pt-2">
          <div className="flex-1 pr-4">
            <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{currentQ.topic?.subject?.name || 'CONHECIMENTOS'}</h2>
            <h1 className="text-xl font-bold leading-tight mt-1">{currentQ.topic?.name || 'Assunto Geral'}</h1>
            <div className="h-1 w-12 bg-[#3ADB6E] rounded-full mt-3" />
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="bg-[#3ADB6E]/10 text-[#3ADB6E] px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
              Questão {currentIndex + 1}/{questions.length}
            </div>
            <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium">
              <Clock className="w-3 h-3" /> 02:15
            </div>
          </div>
        </div>

        {/* STATEMENT */}
        <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl mb-6">
          <CardContent className="p-5">
            <p className="text-[15px] leading-relaxed text-zinc-200 whitespace-pre-wrap">
              {currentQ.statement}
            </p>
          </CardContent>
        </Card>
        
        {/* OPTIONS */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((opt: any, index: number) => {
            const isSelected = selectedOption === opt.orderIndex;
            let borderClass = 'border-zinc-800';
            let bgClass = 'bg-[#111C22]/50 hover:bg-[#111C22]';
            let labelBg = 'bg-[#1A2730] text-zinc-400';
            let textClass = 'text-zinc-200';
            
            if (feedback) {
              if (opt.orderIndex === feedback.correctOption) {
                borderClass = 'border-[#3ADB6E]';
                bgClass = 'bg-[#3ADB6E]/10';
                labelBg = 'bg-[#3ADB6E] text-[#0A0F0D]';
                textClass = 'text-[#3ADB6E] font-bold';
              } else if (isSelected && !feedback.isCorrect) {
                borderClass = 'border-red-500';
                bgClass = 'bg-red-500/10';
                labelBg = 'bg-red-500 text-white';
                textClass = 'text-red-400';
              }
            } else if (isSelected) {
              borderClass = 'border-[#F5C518]';
              bgClass = 'bg-[#F5C518]/10';
              labelBg = 'bg-[#F5C518] text-[#0A0F0D]';
              textClass = 'text-white font-medium';
            }

            return (
              <div 
                key={opt.id} 
                className={`cursor-pointer border-2 transition-all rounded-xl p-4 flex gap-4 ${borderClass} ${bgClass}`}
                onClick={() => !feedback && setSelectedOption(opt.orderIndex)}
              >
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors ${labelBg}`}>
                  {optionLabels[index]}
                </div>
                <div className={`text-sm leading-relaxed pt-1 ${textClass}`}>
                  {opt.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* FEEDBACK & ACTION BUTTON */}
        <div className="mt-auto flex flex-col gap-4">
          {!feedback ? (
            <Button 
              onClick={handleAnswer} 
              disabled={selectedOption === null}
              className="w-full bg-[#00A35C] hover:bg-[#3ADB6E] text-white py-7 rounded-2xl font-bold text-lg"
            >
              Responder ▷
            </Button>
          ) : (
            <div className="w-full flex flex-col gap-4 mt-2">
              <div className={`p-5 rounded-2xl border-2 ${feedback.isCorrect ? 'border-[#3ADB6E] bg-[#3ADB6E]/10 text-[#3ADB6E]' : 'border-red-500 bg-red-500/10 text-white'}`}>
                <h3 className={`font-bold mb-3 flex items-center gap-2 ${feedback.isCorrect ? 'text-[#3ADB6E]' : 'text-red-500'}`}>
                  {feedback.isCorrect ? <><CheckCircle2 className="w-5 h-5"/> ✨ Acertou!</> : <><XCircle className="w-5 h-5"/> ❌ Você Errou!</>}
                </h3>
                
                {!feedback.isCorrect && (
                  <div className="mb-3 p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                    <p className="text-sm font-bold text-red-400">
                      A alternativa correta é a letra <span className="text-white text-lg ml-1 bg-red-500 px-2 py-0.5 rounded">{optionLabels[feedback.correctOption]}</span>
                    </p>
                  </div>
                )}
                
                <div className="mt-2 space-y-3">
                  <div className="bg-[#0A0F0D]/50 p-4 rounded-xl border border-zinc-800">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Comentário do Professor</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {feedback.explanation?.split('Macete:')[0] || "Esta questão ainda não possui um comentário detalhado."}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#F5C518]/20 to-transparent p-4 rounded-xl border border-[#F5C518]/30">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5C518] mb-2 flex items-center gap-2">
                      💡 Macete da PETRA IA
                    </h4>
                    <p className="text-sm text-[#F5C518] leading-relaxed font-medium">
                      {feedback.explanation?.includes('Macete:') 
                        ? feedback.explanation.split('Macete:')[1].trim()
                        : "Sempre elimine as opções que usam palavras absolutas como 'nunca', 'sempre', ou 'exclusivamente' antes de chutar!"}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={nextQuestion}
                className="w-full bg-[#F5C518] hover:bg-[#d9a51c] text-black font-bold py-7 rounded-2xl text-lg mt-2 shadow-[0_4px_14px_0_rgba(245,197,24,0.39)]"
              >
                PRÓXIMA QUESTÃO
              </Button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
