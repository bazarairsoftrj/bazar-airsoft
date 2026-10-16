'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createReportAction } from '@/app/actions/adminActions';
import { getSellerWhatsAppLinkAction } from '@/app/actions/listingActions';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  MessageCircle,
  AlertTriangle,
  X,
  Check,
  PauseCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openingWhatsApp, setOpeningWhatsApp] = useState(false);

  // Galeria
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Denúncia
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('GOLPE_SUSPEITA');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('listings')
      .select(`
        id,
        title,
        description,
        price,
        condition,
        brand,
        model,
        city,
        region,
        status,
        published_at,
        categories ( name ),
        seller_contacts ( display_name ),
        listing_images ( public_url, sort_order )
      `)
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setItem(data);
        setLoading(false);
      });
  }, [id]);

  const handleOpenWhatsApp = async () => {
    setOpeningWhatsApp(true);
    const res = await getSellerWhatsAppLinkAction(id);
    setOpeningWhatsApp(false);

    if (res.error) {
      alert(res.error);
    } else if (res.url) {
      window.open(res.url, '_blank');
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReporting(true);

    const formData = new FormData();
    formData.set('listingId', id);
    formData.set('reason', reportReason);
    formData.set('details', reportDetails);

    const res = await createReportAction(formData);
    setReporting(false);

    if (res.success) {
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportDetails('');
      }, 2500);
    } else {
      alert(res.error || 'Erro ao registrar denúncia.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937]">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center text-sm text-zinc-500">
          Carregando informações do item...
        </main>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937]">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-base font-bold text-zinc-800">Anúncio não encontrado ou expirado.</p>
          <Link href="/" className="mt-3 inline-block text-xs font-bold text-[#556B2F] underline">
            Voltar ao catálogo
          </Link>
        </main>
      </div>
    );
  }

  if (item.status === 'PAUSADO') {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
        <div>
          <Header />
          <main className="mx-auto max-w-lg px-4 py-16 text-center">
            <div className="rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-3">
                <PauseCircle className="h-8 w-8" />
              </div>
              <h1 className="font-bebas text-2xl tracking-wide uppercase text-zinc-900">
                Anúncio Pausado
              </h1>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                Este anúncio foi temporariamente pausado pelo anunciante e não se encontra disponível para negociação no momento.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#556B2F] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#445625]"
                  style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
                >
                  <ArrowLeft className="h-4 w-4" /> Ver Outros Itens
                </Link>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const isSold = item.status === 'VENDIDO';
  const images = item.listing_images || [];
  const currentImageUrl = images[activeImageIndex]?.public_url;

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(item.price));

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
      <div>
        <Header />

        <main className="mx-auto max-w-3xl px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
          </Link>

          {isSold && (
            <div className="mb-4 rounded-xl border border-zinc-300 bg-zinc-900 p-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Item Já Vendido
                </span>
              </div>
              <span className="text-[11px] text-zinc-300">
                Este equipamento já não está disponível para negociação.
              </span>
            </div>
          )}

          {/* Galeria de Fotos */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm p-3">
            <div className="relative aspect-video w-full rounded-xl bg-zinc-100 overflow-hidden sm:aspect-[16/10] flex items-center justify-center">
              {currentImageUrl ? (
                <>
                  <Image
                    src={currentImageUrl}
                    alt={item.title}
                    fill
                    priority
                    className={`object-contain p-2 ${isSold ? 'grayscale' : ''}`}
                  />

                  <button
                    type="button"
                    onClick={() => setIsZoomOpen(true)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition shadow-md cursor-pointer"
                    title="Ampliar foto"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 transition cursor-pointer"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="text-zinc-400 text-xs">Sem fotos disponíveis</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                      activeImageIndex === idx
                        ? 'border-[#556B2F] ring-2 ring-[#556B2F]/30 scale-102'
                        : 'border-zinc-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.public_url}
                      alt={`Miniatura ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dados Principais */}
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#556B2F]">
                {item.categories?.name}
              </span>
              <span className="rounded bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-800 uppercase">
                {item.condition}
              </span>
            </div>

            <h1 className="mt-2 text-xl font-bold text-zinc-900 sm:text-2xl">{item.title}</h1>
            <p className="mt-2 text-3xl font-black text-zinc-950">{formattedPrice}</p>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500 border-t border-zinc-100 pt-3">
              <MapPin className="h-4 w-4 text-[#556B2F]" />
              <span>Localização: <strong>{item.city} {item.region ? `(${item.region})` : ''}</strong></span>
            </div>

            <div className="mt-2 text-xs text-zinc-500">
              Anunciante: <strong>{item.seller_contacts?.display_name || 'Vendedor da Comunidade'}</strong>
            </div>

            {/* Ação Direta para o WhatsApp do Vendedor */}
            <div className="mt-6">
              {isSold ? (
                <div className="w-full rounded-xl bg-zinc-200 py-3.5 text-center text-xs font-bold uppercase text-zinc-500 cursor-not-allowed">
                  Item Vendido • Contato Desativado
                </div>
              ) : (
                <button
                  type="button"
                  disabled={openingWhatsApp}
                  onClick={handleOpenWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#556B2F] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#445625] cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
                >
                  <MessageCircle className="h-5 w-5" />
                  {openingWhatsApp ? 'Abrindo conversa...' : 'Falar pelo WhatsApp'}
                </button>
              )}
            </div>

            {/* Ação Denúncia */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Denunciar este anúncio
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="font-bebas text-xl tracking-wide text-zinc-900 mb-2">Descrição do Item</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
              {item.description}
            </p>
          </div>

          {/* Aviso de Segurança */}
          <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            <ShieldCheck className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-bold">Aviso de negociação responsável:</p>
              <p className="mt-0.5">
                O Bazar Airsoft não processa pagamentos nem intermedia envios. Marque encontros presenciais em locais públicos e seguros para inspecionar o equipamento antes de efetuar qualquer transação.
              </p>
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Modal de Zoom */}
      {isZoomOpen && currentImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative h-full w-full max-w-4xl max-h-[85vh] flex items-center justify-center">
            <Image
              src={currentImageUrl}
              alt={item.title}
              fill
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition cursor-pointer"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition cursor-pointer"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Modal de Denúncia */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-5 w-5" />
            </button>

            {reportSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-900">Denúncia enviada com sucesso!</h3>
                <p className="mt-1 text-xs text-zinc-600">
                  O moderador do bazar irá analisar este anúncio brevemente.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendReport}>
                <h3 className="text-base font-bold text-zinc-900">Denunciar Anúncio</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  A sua denúncia é confidencial e será avaliada pela moderação.
                </p>

                <div className="mt-4">
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    Motivo da Denúncia *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:outline-none"
                  >
                    <option value="GOLPE_SUSPEITA">Tentativa de burla ou golpe</option>
                    <option value="ARMA_FOGO_PROIBIDO">Arma de fogo real ou artigo proibido</option>
                    <option value="VALOR_ENGANOSO">Preço ou descrição enganosa</option>
                    <option value="IMAGEM_INDEVIDA">Fotografia falsa ou não autorizada</option>
                    <option value="OFENSIVO">Conteúdo impróprio ou ofensivo</option>
                    <option value="OUTRO">Outro motivo</option>
                  </select>
                </div>

                <div className="mt-3">
                  <label className="block text-xs font-bold uppercase text-zinc-700 mb-1">
                    Detalhes Adicionais (Opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Explique resumidamente a irregularidade..."
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="w-1/2 rounded-xl border border-zinc-200 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={reporting}
                    className="w-1/2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                  >
                    {reporting ? 'A enviar...' : 'Enviar Denúncia'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}