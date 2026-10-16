'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { createListingAction } from '@/app/actions/listingActions';
import { Camera, X, CheckCircle, Copy, MessageCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NovoAnuncioPage() {
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdData, setCreatedData] = useState<{ listingId: string; manageToken: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Estado para a máscara do telemóvel
  const [phone, setPhone] = useState('');

  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  // Máscara automática: (XX) 9XXXX-XXXX
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      alert('Pode enviar no máximo 4 fotografias.');
      return;
    }
    const newImages = [...images, ...files].slice(0, 4);
    setImages(newImages);
    setPreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      if (images.length === 0) {
        setErrorMsg('Adicione pelo menos 1 fotografia do artigo.');
        setLoading(false);
        return;
      }

      // 1. Upload das fotografias para o Supabase Storage
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file);

        if (uploadError) {
          throw new Error('Falha ao enviar fotografia: ' + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(uploadData.path);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      formData.set('imageUrls', JSON.stringify(uploadedUrls));

      // 2. Chamar a Server Action
      const res = await createListingAction(formData);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.success && res.listingId && res.manageToken) {
        setCreatedData({
          listingId: res.listingId,
          manageToken: res.manageToken,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao publicar o anúncio.');
    } finally {
      setLoading(false);
    }
  };

  if (createdData) {
    const manageUrl = `${window.location.origin}/gerenciar/${createdData.manageToken}`;
    const copyToClipboard = () => {
      navigator.clipboard.writeText(manageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    };

    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937]">
        <Header />
        <main className="mx-auto max-w-lg px-4 py-10">
          <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-md">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
            <h1 className="text-2xl font-bold uppercase text-[#1F2937]">
              Anúncio Publicado com Sucesso!
            </h1>
            <p className="mt-2 text-xs text-zinc-600">
              O seu artigo já se encontra visível na montra do bazar.
            </p>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900">
              <p className="font-bold">Guarde o seu Link Privado de Gestão:</p>
              <p className="mt-1">
                Sem necessidade de palavras-passe, utilize este endereço exclusivo para <strong>marcar como vendido</strong>, pausar ou alterar o preço.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={manageUrl}
                  className="w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-zinc-800"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-[#556B2F] px-3 py-1.5 font-bold text-white text-xs hover:bg-[#445625] cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Link de gestão do meu anúncio no Bazar Airsoft: ${manageUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#556B2F] py-3 text-xs font-bold text-white hover:bg-[#445625]"
              >
                <MessageCircle className="h-4 w-4" />
                Guardar link no meu WhatsApp
              </a>

              <Link
                href={`/anuncios/${createdData.listingId}`}
                className="rounded-xl border border-zinc-300 bg-white py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50"
              >
                Ver o anúncio publicado
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] pb-16">
      <Header />

      <main className="mx-auto max-w-xl px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Cancelar e voltar
        </Link>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-[#1F2937]">
            Publicar Novo Anúncio
          </h1>
          <p className="text-xs text-zinc-500 mb-6">
            Preencha os dados do seu equipamento. A publicação é imediata e gratuita.
          </p>

          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fotos */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                Fotografias do Produto (1 a 4 fotos) *
              </label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200">
                    <img src={src} alt="Pré-visualização" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 rounded-full bg-zinc-900/80 p-1 text-white hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {previews.length < 4 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition">
                    <Camera className="h-5 w-5 text-zinc-400" />
                    <span className="mt-1 text-[10px] font-medium text-zinc-500">Adicionar</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Título */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                Título do Anúncio *
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Ex: Rifle M4A1 CYMA Full Metal + 2 Mags"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
              />
            </div>

            {/* Categoria e Condição */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                  Categoria *
                </label>
                <select
                  name="categoryId"
                  required
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F] bg-white"
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                  Condição *
                </label>
                <select
                  name="condition"
                  required
                  defaultValue="USADO"
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F] bg-white"
                >
                  <option value="NOVO">Novo</option>
                  <option value="SEMI_NOVO">Semi-novo</option>
                  <option value="USADO">Usado</option>
                  <option value="DEFEITO_PECAS">Com defeito / Peças</option>
                </select>
              </div>
            </div>

            {/* Preço e Cidade */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0,00"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  defaultValue="Campos dos Goytacazes"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                />
              </div>
            </div>

            {/* Bairro / Região */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                Bairro ou Região (Opcional)
              </label>
              <input
                type="text"
                name="region"
                placeholder="Ex: Pelinca, Centro, IPS..."
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                Descrição do Artigo *
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Descreva o estado, tempo de uso, acessórios incluídos e detalhes..."
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
              />
            </div>

            <div className="border-t border-zinc-200 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#556B2F] mb-3">
                Dados de Contacto
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    name="sellerName"
                    required
                    placeholder="Ex: Carlos Silva"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1F2937] mb-1">
                    WhatsApp (com DDD) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    placeholder="(22) 99999-9999"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                  />
                </div>
              </div>
            </div>

            {/* Termos de responsabilidade */}
            <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-[11px] text-zinc-600">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" required className="mt-0.5 rounded text-[#556B2F]" />
                <span>
                  Declaro que este artigo é exclusivo para a prática desportiva de <strong>airsoft</strong>, não se trata de arma de fogo real e que sou o responsável pelas informações prestadas.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#F97316] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#EA580C] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'A enviar fotografias e a publicar...' : 'Publicar Anúncio Agora'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}