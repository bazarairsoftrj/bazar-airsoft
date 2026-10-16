'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { Search, PlusCircle, ShieldAlert } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
      {/* Banner de segurança superior */}
      <div className="bg-[#D7C9A8]/30 px-3 py-1 text-center text-xs text-[#1F2937] border-b border-[#D7C9A8]/40 flex items-center justify-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-[#F97316]" />
        <span className="font-medium text-[11px] sm:text-xs">
          Negociação entre particulares. Encontre-se sempre em locais públicos e seguros.
        </span>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logótipo */}
        <Logo variant="dark" />

        {/* Menu de Navegação da Maquete (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600">
          <Link href="/" className="hover:text-[#556B2F] transition text-[#1F2937] font-bold">
            Início
          </Link>
          <Link href="/#catalogo" className="hover:text-[#556B2F] transition">
            Anúncios
          </Link>
          <Link href="/#categorias" className="hover:text-[#556B2F] transition">
            Categorias
          </Link>
          <Link href="/regras" className="hover:text-[#556B2F] transition">
            Regras
          </Link>
          <Link href="/recuperar" className="hover:text-[#556B2F] transition">
            Gerenciar Anúncio
          </Link>
        </nav>

        {/* Ações no Topo */}
        <div className="flex items-center gap-3">
          <Link
            href="/#catalogo"
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 transition"
            title="Procurar artigos"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Botão Anunciar em Verde-Oliva como na Maquete */}
          <Link
            href="/novo"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#556B2F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#445625] active:scale-95 cursor-pointer"
            style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
          >
            <PlusCircle className="h-4 w-4 text-white" />
            <span>Anunciar</span>
          </Link>
        </div>
      </div>
    </header>
  );
}