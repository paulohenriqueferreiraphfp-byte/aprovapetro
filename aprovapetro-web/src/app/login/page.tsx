'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    try {
      const res = await fetch(`https://aprovapetro.onrender.com/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.userId) {
        localStorage.setItem('user', JSON.stringify(data));
        if (data.isOnboarded) {
          router.push('/');
        } else {
          router.push('/onboarding');
        }
      } else {
        setError(data.message || 'E-mail ou senha incorretos.');
      }
    } catch (e) {
      console.error(e);
      setError('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#18181B] border-zinc-800 text-white">
        <CardHeader className="space-y-2 text-center">
          <img src="/logo.png" alt="AprovaPETRO" className="h-16 object-contain mx-auto" />
          <p className="text-zinc-400">Entre para acessar seu treinador inteligente</p>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm">{error}</div>}
          
          <input 
            type="email" 
            placeholder="Seu e-mail"
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-[#00B37E] outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Sua senha"
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-[#00B37E] outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin} className="w-full bg-[#00B37E] hover:bg-[#009266] py-6 text-lg rounded-xl shadow-[0_0_15px_rgba(0,179,126,0.3)]">
            ENTRAR
          </Button>

          <p className="text-center text-sm text-zinc-400 mt-4">
            Não tem uma conta? <Link href="/register" className="text-[#00B37E] hover:underline">Cadastre-se</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
