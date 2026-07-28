'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bot, Lightbulb, Activity } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';

export default function MissaoPage() {
  const [radarData, setRadarData] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (!u.userId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/stats/radar?userId=${u.userId}`)
      .then(res => res.json())
      .then(setRadarData)
      .catch(console.error);
      
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/stats/diagnostics?userId=${u.userId}`)
      .then(res => res.json())
      .then(setDiagnostics)
      .catch(console.error);
  }, []);

  const calculateRadarPolygon = (data: any[]) => {
    if (data.length < 6) return '';
    // SVG center is (50,50), radius is 45 (to fit in 100x100 viewbox leaving 5 for padding)
    // Angles for 6 points: -90, -30, 30, 90, 150, 210 degrees
    const angles = [-Math.PI/2, -Math.PI/6, Math.PI/6, Math.PI/2, 5*Math.PI/6, 7*Math.PI/6];
    
    return data.map((d, i) => {
      const r = (d.score / 100) * 45;
      const x = 50 + r * Math.cos(angles[i]);
      const y = 50 + r * Math.sin(angles[i]);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="h-full bg-[#0A0F0D] text-white flex flex-col relative pb-20">
      
      {/* HEADER */}
      <header className="px-5 py-4 flex items-center justify-between z-10 sticky top-0 bg-[#0A0F0D]/90 backdrop-blur-sm relative border-b border-zinc-800/50">
        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
          <User className="w-6 h-6 text-zinc-400" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img src="/logo.png" alt="AprovaPETRO" className="h-14 object-contain" />
        </div>
        <button className="w-10 h-10 bg-[#3ADB6E]/10 rounded-xl flex items-center justify-center text-[#3ADB6E]">
          <Bot className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-8 space-y-6 pt-6">
        
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-[#3ADB6E]">MAPA™ Performance</h1>
          <p className="text-zinc-400 text-sm mt-1">Análise tática do seu desempenho rumo à Petrobras.</p>
        </div>

        {/* EQUILÍBRIO DE COMPETÊNCIAS (RADAR CHART) */}
        <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Activity className="text-[#3ADB6E] w-5 h-5" />
                <h3 className="font-bold text-white">Equilíbrio de Competências</h3>
              </div>
              <span className="bg-[#3ADB6E]/20 text-[#3ADB6E] text-[10px] font-bold px-2 py-1 rounded-full uppercase">Realtime</span>
            </div>
            
            <div className="relative w-full aspect-square max-w-[280px] mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                {/* Hexagons Background */}
                {[15, 30, 45].map((r, i) => (
                  <polygon key={i} points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" 
                    className="stroke-zinc-800 fill-none stroke-[0.5]" 
                    style={{ transformOrigin: 'center', transform: `scale(${r/45})` }}
                  />
                ))}
                
                {/* Data Polygon from API */}
                {radarData.length >= 6 && (
                  <polygon 
                    points={calculateRadarPolygon(radarData)} 
                    fill="rgba(58, 219, 110, 0.2)" 
                    stroke="#3ADB6E" 
                    strokeWidth="1.5" 
                    className="transition-all duration-1000"
                  />
                )}
                
                {/* Lines from center */}
                <line x1="50" y1="50" x2="50" y2="5" stroke="#27272a" strokeWidth="1" />
                <line x1="50" y1="50" x2="89" y2="27.5" stroke="#27272a" strokeWidth="1" />
                <line x1="50" y1="50" x2="89" y2="72.5" stroke="#27272a" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="95" stroke="#27272a" strokeWidth="1" />
                <line x1="50" y1="50" x2="11" y2="72.5" stroke="#27272a" strokeWidth="1" />
                <line x1="50" y1="50" x2="11" y2="27.5" stroke="#27272a" strokeWidth="1" />
              </svg>
              
              {radarData.length >= 6 && (
                <>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-[10px] text-white font-bold">{radarData[0].subject} <span className="text-[#3ADB6E]">{radarData[0].score}%</span></div>
                  <div className="absolute top-1/4 -right-6 text-[10px] text-white font-bold">{radarData[1].subject} <span className="text-[#3ADB6E]">{radarData[1].score}%</span></div>
                  <div className="absolute bottom-1/4 -right-6 text-[10px] text-white font-bold">{radarData[2].subject} <span className="text-[#3ADB6E]">{radarData[2].score}%</span></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 text-[10px] text-white font-bold">{radarData[3].subject} <span className="text-[#3ADB6E]">{radarData[3].score}%</span></div>
                  <div className="absolute bottom-1/4 -left-8 text-[10px] text-white font-bold">{radarData[4].subject} <span className="text-[#3ADB6E]">{radarData[4].score}%</span></div>
                  <div className="absolute top-1/4 -left-4 text-[10px] text-white font-bold">{radarData[5].subject} <span className="text-[#3ADB6E]">{radarData[5].score}%</span></div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PILAR 1: DIAGNÓSTICO */}
        <Card className="bg-[#111C22] border-zinc-800/50 rounded-2xl">
          <CardContent className="p-6">
            <h3 className="font-bold flex items-center gap-2 mb-1 text-white"><span className="text-[#EF4444]">🌸</span> Pilar 1: Diagnóstico</h3>
            <p className="text-xs text-zinc-400 mb-5">Assuntos Esquecidos (Revisão Imediata)</p>
            
            <div className="space-y-3 mb-6">
              {diagnostics.map((diag, i) => (
                <div key={i} className="bg-[#0A0F0D] border border-zinc-800/50 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-white">{diag.subject}</h4>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${diag.type === 'danger' ? 'text-[#EF4444] bg-[#EF4444]/10' : 'text-[#F5C518] bg-[#F5C518]/10'}`}>
                      -{diag.drop}% drop
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{diag.msg}</p>
                </div>
              ))}
            </div>

            <Button className="w-full bg-[#00A35C] hover:bg-[#3ADB6E] text-white font-bold py-6 rounded-xl">
              GERAR TREINO DE RECUPERAÇÃO
            </Button>
          </CardContent>
        </Card>

        {/* INSIGHT DO MAPA */}
        <Card className="bg-gradient-to-br from-[#111C22] to-[#0A0F0D] border-[#3ADB6E]/30 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#3ADB6E]" />
          <CardContent className="p-6 flex gap-4">
            <div className="bg-[#3ADB6E]/10 p-3 rounded-full h-fit mt-1">
              <Lightbulb className="w-6 h-6 text-[#3ADB6E]" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-2 text-white">Insight do MAPA™:<br/>Oportunidade de Salto</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Se você focar 45 minutos extras em <strong className="text-[#3ADB6E]">NR-10</strong> e <strong className="text-[#3ADB6E]">Instalações Elétricas</strong> nos próximos 3 dias, sua probabilidade de aprovação no Top 100 sobe de <strong className="text-white">68%</strong> para <strong className="text-white">84%</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

      </main>
      <BottomNav />
    </div>
  );
}

function TrophyIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7c0 6 6 9 6 9s6-3 6-9Z" />
    </svg>
  );
}
