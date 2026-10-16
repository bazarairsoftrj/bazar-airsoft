import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
      <div>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-zinc-600 hover:text-zinc-900 mb-4">
            <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
          </Link>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4 text-xs leading-relaxed text-zinc-700">
            <h1 className="text-xl font-bold uppercase text-zinc-900">Termos de Uso</h1>
            <p>
              O <strong>Bazar Airsoft</strong> é uma plataforma digital comunitária de classificados, com a finalidade exclusiva de divulgar equipamentos desportivos de airsoft entre particulares.
            </p>
            <h2 className="text-sm font-bold text-zinc-900 pt-2">1. Natureza do Serviço</h2>
            <p>
              A plataforma atua unicamente como catálogo de divulgação. Não intermediamos pagamentos, não realizamos entregas e não cobramos comissão por negociações.
            </p>
            <h2 className="text-sm font-bold text-zinc-900 pt-2">2. Responsabilidade do Anunciante</h2>
            <p>
              O anunciante é o único responsável pela procedência, estado de conservação e veracidade das informações do artigo. Recomendamos sempre a realização de negociações presenciais em locais públicos e seguros.
            </p>
            <h2 className="text-sm font-bold text-zinc-900 pt-2">3. Proibição Expressa de Armamento Real</h2>
            <p>
              É estritamente proibida a publicação de armas de fogo reais, munições de chumbo/letais ou itens ilícitos. Anúncios com essas características serão removidos e banidos de imediato.
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}