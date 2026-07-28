'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.userId) {
        localStorage.setItem('user', JSON.stringify(data));
        router.push('/onboarding');
      } else {
        setError(data.message || 'Erro ao criar conta.');
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
          <CardTitle className="text-3xl font-bold text-[#00B37E]">Criar Conta</CardTitle>
          <p className="text-zinc-400">Junte-se à maior plataforma para a Petrobras</p>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          {error && <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg text-sm">{error}</div>}
          
          <input 
            type="text" 
            placeholder="Seu nome completo"
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-[#00B37E] outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Seu melhor e-mail"
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
          
          <Button onClick={handleRegister} className="w-full bg-[#00B37E] hover:bg-[#009266] py-6 text-lg rounded-xl shadow-[0_0_15px_rgba(0,179,126,0.3)]">
            CADASTRAR
          </Button>

          <p className="text-center text-sm text-zinc-400 mt-4">
            Já tem uma conta? <Link href="/login" className="text-[#00B37E] hover:underline">Faça login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
