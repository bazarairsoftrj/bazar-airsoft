'use client';

import { useState } from 'react';
import { loginAdminAction } from '@/app/actions/authActions';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const res = await loginAdminAction(password);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
      <div>
        <Header />

        <main className="mx-auto max-w-sm px-4 py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-[#1F2937] mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
          </Link>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F2937] text-white mb-2 shadow-xs">
                <Shield className="h-6 w-6 text-[#D7C9A8]" />
              </div>
              <h1 className="font-bebas text-2xl tracking-wide uppercase text-[#1F2937]">
                Acesso de Moderação
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">Área restrita aos administradores do bazar</p>
            </div>

            {errorMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                  Palavra-passe de Administrador *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Introduza a sua senha"
                    className="w-full rounded-xl border border-zinc-200 pl-9 pr-3 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1F2937] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? 'A validar...' : 'Entrar no Painel'}
              </button>
            </form>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}