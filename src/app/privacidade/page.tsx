import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
      <div>
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-zinc-600 hover:text-zinc-900 mb-4">
            <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
          </Link>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs space-y-4 text-xs leading-relaxed text-zinc-700">
            <h1 className="text-xl font-bold uppercase text-zinc-900">Política de Privacidade</h1>
            <p>
              O Bazar Airsoft adota medidas transparentes para a preservação e segurança dos dados dos seus utilizadores:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-600">
              <li><strong>Minimização de Dados:</strong> Recolhemos apenas o nome e o número de WhatsApp necessários para viabilizar a negociação do artigo.</li>
              <li><strong>Proteção contra Captura Automatizada:</strong> O número de telemóvel não é exibido em texto aberto na montra para evitar indexação e robôs de spam.</li>
              <li><strong>Criptografia em Repouso:</strong> O número de contacto é gravado com criptografia simétrica AES-256 na base de dados.</li>
              <li><strong>Sem Rastreio Comercial:</strong> Não comercializamos nem partilhamos dados com empresas terceiras de publicidade.</li>
              <li><strong>Eliminação de Dados:</strong> O anunciante pode eliminar o seu anúncio e contacto associado a qualquer momento através do seu link exclusivo de gestão.</li>
            </ul>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}