'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getListingsByPhoneAction, recordRecoveryRequestAction } from '@/app/actions/listingActions';
import { ArrowLeft, KeyRound, MessageCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function RecuperarAnuncioPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<any>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    setPhone(value);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);
    setLoading(true);

    const res = await getListingsByPhoneAction(phone);
    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setResult(res);
    }
  };

  const handleContactAdmin = async (listingId: string, title: string) => {
    // 1. Notifica a base de dados para o painel do administrador
    await recordRecoveryRequestAction(listingId, result.phone);

    // 2. Prepara a mensagem para o WhatsApp do administrador
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '22999999999';
    const message = encodeURIComponent(
      `Olá, Administrador do Bazar Airsoft!\n\nPerdi o link de gestão do meu anúncio:\n- *Título:* ${title}\n- *ID:* ${listingId}\n- *Meu WhatsApp:* ${result.phone}\n\nPoderia me reenviar o link privado de controle? Obrigado!`
    );

    window.open(`https://wa.me/55${adminPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
      <div>
        <Header />

        <main className="mx-auto max-w-lg px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-[#1F2937] mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
          </Link>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#556B2F] text-white">
                <KeyRound className="h-5 w-5 text-[#D7C9A8]" />
              </div>
              <h1 className="font-bebas text-2xl tracking-wide uppercase text-[#1F2937]">
                Recuperar Acesso ao Anúncio
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
              Perdeu o link para gerenciar seu equipamento? Digite seu WhatsApp para identificar seus anúncios e solicitar a chave ao administrador.
            </p>

            {errorMsg && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!result ? (
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    WhatsApp Informado no Anúncio *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    placeholder="(22) 99999-9999"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#556B2F] py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#445625] disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
                >
                  {loading ? 'A pesquisar anúncios...' : 'Consultar Meus Anúncios'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#D7C9A8] bg-[#D7C9A8]/20 p-3 text-xs text-zinc-800 flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-[#556B2F] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Medida de Segurança Ativa:</p>
                    <p className="mt-0.5 text-[11px] text-zinc-600">
                      Por segurança, o link de edição não é exibido diretamente nesta tela. Escolha o anúncio abaixo e clique para solicitar a liberação ao administrador pelo WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {result.items.map((item: any) => (
                    <div key={item.id} className="rounded-xl border border-zinc-200 p-4 bg-[#F8F7F4] space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#1F2937] truncate max-w-[220px]">
                          {item.title}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 uppercase">
                          {item.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#556B2F] font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleContactAdmin(item.id, item.title)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#556B2F] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#445625] transition cursor-pointer shadow-xs"
                        style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Pedir Link ao Administrador no WhatsApp
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="w-full text-center text-xs font-semibold text-zinc-500 hover:underline pt-2 cursor-pointer"
                >
                  Pesquisar outro número
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}