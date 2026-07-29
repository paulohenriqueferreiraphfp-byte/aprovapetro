'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function InstallPwaBanner() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Default true to prevent flash
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosTutorial, setShowIosTutorial] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMedia || isIOSStandalone);
      
      // If not standalone, we can show the banner
      if (!isStandaloneMedia && !isIOSStandalone) {
        // Delay showing banner to not interrupt initial load
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    checkStandalone();

    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Listen for beforeinstallprompt on Android/Chrome
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosTutorial(true);
      setShowBanner(false);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowBanner(false);
      }
    } else {
      // Fallback if beforeinstallprompt didn't fire but not iOS
      alert('Para instalar, toque no menu do navegador (três pontinhos) e selecione "Adicionar à Tela Inicial".');
    }
  };

  if (isStandalone) return null;

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-50 bg-[#111C22] border border-[#3ADB6E]/50 rounded-2xl p-4 shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
          >
            <button 
              onClick={() => setShowBanner(false)}
              className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="bg-[#3ADB6E]/20 p-3 rounded-xl flex-shrink-0">
                <Download className="w-6 h-6 text-[#3ADB6E]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">Instalar o Aplicativo</h3>
                <p className="text-xs text-zinc-400 mt-1">Mais rápido e não consome espaço no celular!</p>
              </div>
              <Button 
                onClick={handleInstallClick}
                className="bg-[#3ADB6E] hover:bg-[#00A35C] text-black font-bold text-xs py-2 px-4 rounded-lg"
              >
                BAIXAR
              </Button>
            </div>
          </motion.div>
        )}

        {showIosTutorial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-end pb-10 px-5"
            onClick={() => setShowIosTutorial(false)}
          >
            <div className="bg-[#111C22] w-full max-w-sm rounded-3xl p-6 border border-zinc-800 shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setShowIosTutorial(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-xl font-bold text-white mb-6 text-center">Instalar no iPhone</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Share className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-sm text-zinc-300 font-medium">1. Toque no ícone de <b>Compartilhar</b> na barra inferior do Safari.</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 border-2 border-white rounded flex items-center justify-center text-xl font-bold pb-1">+</div>
                  </div>
                  <p className="text-sm text-zinc-300 font-medium">2. Role para baixo e selecione <b>Adicionar à Tela de Início</b>.</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowIosTutorial(false)}
                className="w-full mt-8 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-6 rounded-xl text-lg"
              >
                Entendi
              </Button>
              
              {/* Arrow pointing down */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white animate-bounce">
                ↓
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
