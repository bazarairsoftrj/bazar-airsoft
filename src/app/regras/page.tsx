import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function RegrasPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
      <div>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-zinc-600 hover:text-zinc-900 mb-4">
            <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
          </Link>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-5 text-xs text-zinc-700">
            <h1 className="text-xl font-bold uppercase text-zinc-900">Regras da Comunidade</h1>
            
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Artigos Permitidos:
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-zinc-600">
                <li>Réplicas de airsoft (AEG, GBB, Springers) com ponta laranja/vermelha.</li>
                <li>Equipamentos táticos (coletes, fardamentos, botas, coldres, cintos).</li>
                <li>Acessórios (red dots, miras óticas, magazines, BBs plásticas, baterias).</li>
                <li>Proteção individual (óculos balísticos de proteção, máscaras, capacetes).</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <h2 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                <XCircle className="h-4 w-4" /> Artigos Proibidos:
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-zinc-600">
                <li>Armas de fogo reais, armas de pressão de chumbinho, munições reais ou pólvora.</li>
                <li>Itens sem procedência legal ou com identificação adulterada.</li>
                <li>Fotografias retiradas da internet que não correspondam ao estado real do produto.</li>
                <li>Tentativas de fraude, cobrança antecipada com desculpas enganosas ou golpes.</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}