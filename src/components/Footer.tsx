import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white text-xs text-zinc-500">
      {/* Secção de Links Institucionais */}
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <Logo variant="dark" showSubtitle={false} />
          <p className="text-[11px] text-zinc-400 mt-1">
            Classificados da comunidade desportiva de airsoft em Campos dos Goytacazes - RJ.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold">
          <Link href="/regras" className="text-zinc-600 hover:text-[#556B2F] transition">
            Regras da Comunidade
          </Link>
          <Link href="/termos" className="text-zinc-600 hover:text-[#556B2F] transition">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="text-zinc-600 hover:text-[#556B2F] transition">
            Privacidade
          </Link>
          <Link href="/recuperar" className="text-zinc-600 hover:text-[#556B2F] transition">
            Recuperar Anúncio
          </Link>
          <Link href="/admin" className="text-zinc-400 hover:text-zinc-600 transition">
            Painel Admin
          </Link>
        </div>
      </div>

      {/* Faixa Escura Inferior Idêntica à Maquete */}
      <div className="bg-[#1F2937] py-3.5 px-4 text-center text-[11px] text-[#D7C9A8] border-t border-zinc-800 flex items-center justify-center gap-2">
        <span className="font-bold text-white">Bazar Airsoft</span>
        <span className="text-zinc-500">•</span>
        <span>Feito por quem vive o esporte.</span>
      </div>
    </footer>
  );
}