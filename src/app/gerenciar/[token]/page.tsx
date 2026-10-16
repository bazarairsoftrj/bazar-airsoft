'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  getListingByManageToken,
  updateListingStatusAction,
  updateListingFullAction,
  deleteListingAction,
} from '@/app/actions/listingActions';
import {
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  Edit3,
  X,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function GerenciarAnuncioPage() {
  const params = useParams();
  const token = params.token as string;

  const [listing, setListing] = useState<any>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    categoryId: '',
    price: '',
    condition: 'USADO',
    city: '',
    region: '',
    description: '',
  });

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    const res = await getListingByManageToken(token);
    if (res.error || !res.listing) {
      setErrorMsg(res.error || 'Anúncio não encontrado ou link inválido.');
    } else {
      const item = res.listing;
      setListing(item);
      setEditForm({
        title: item.title || '',
        categoryId: item.category_id ? String(item.category_id) : '',
        price: item.price !== undefined && item.price !== null ? String(item.price) : '',
        condition: item.condition || 'USADO',
        city: item.city || '',
        region: item.region || '',
        description: item.description || '',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    supabase
      .from('categories')
      .select('id, name')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, [token]);

  const handleStatusChange = async (status: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    setUpdating(true);
    const res = await updateListingStatusAction(token, status);
    setUpdating(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg(`Estado alterado para ${status} com sucesso!`);
      loadData();
    }
  };

  const handleSaveFullEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setUpdating(true);

    const formData = new FormData();
    formData.set('title', editForm.title);
    formData.set('categoryId', editForm.categoryId);
    formData.set('price', editForm.price);
    formData.set('condition', editForm.condition);
    formData.set('city', editForm.city);
    formData.set('region', editForm.region);
    formData.set('description', editForm.description);

    const res = await updateListingFullAction(token, formData);
    setUpdating(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Anúncio atualizado com sucesso!');
      setIsEditing(false);
      loadData();
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem a certeza de que deseja remover este anúncio definitivamente? Esta ação não pode ser desfeita.')) {
      return;
    }
    setIsDeleting(true);
    const res = await deleteListingAction(token);
    if (res.error) {
      setErrorMsg(res.error);
      setIsDeleting(false);
    } else {
      alert('Anúncio removido com sucesso.');
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937]">
        <Header />
        <main className="mx-auto max-w-lg px-4 py-20 text-center">
          <p className="text-sm font-semibold text-zinc-500">A carregar detalhes do anúncio...</p>
        </main>
      </div>
    );
  }

  if (errorMsg && !listing) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937]">
        <Header />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-500 mb-2" />
            <h1 className="text-lg font-bold text-[#1F2937]">Acesso Inválido</h1>
            <p className="mt-1 text-xs text-zinc-600">{errorMsg}</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#556B2F] underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao catálogo
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isSold = listing?.status === 'VENDIDO';
  const isPaused = listing?.status === 'PAUSADO';

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
      <div>
        <Header />

        <main className="mx-auto max-w-xl px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-[#1F2937] mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
          </Link>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#556B2F]">
                  Painel de Gestão do Vendedor
                </span>
                <h1 className="font-bebas text-2xl tracking-wide text-[#1F2937] mt-0.5">Gerir Anúncio</h1>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  isSold
                    ? 'bg-[#1F2937] text-white'
                    : isPaused
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {listing?.status}
              </span>
            </div>

            {successMsg && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
                {errorMsg}
              </div>
            )}

            {/* Resumo do artigo */}
            <div className="mt-5 flex gap-3.5 rounded-xl border border-zinc-100 bg-[#F8F7F4] p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                {listing?.listing_images?.[0]?.public_url ? (
                  <Image
                    src={listing.listing_images[0].public_url}
                    alt={listing?.title || 'Foto do artigo'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                    Sem foto
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  {listing?.categories?.name}
                </span>
                <h2 className="truncate text-sm font-bold text-[#1F2937]">{listing?.title}</h2>
                <span className="text-xs font-bold text-[#556B2F]">
                  {listing?.price !== undefined && listing?.price !== null && new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(listing.price))}
                </span>
              </div>
            </div>

            <div className="mt-3 text-right">
              <Link
                href={`/anuncios/${listing?.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#556B2F] hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Ver como aparece na montra pública
              </Link>
            </div>

            {/* Ações de Estado */}
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                Estado do Anúncio
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {isSold ? (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange('PUBLICADO')}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#556B2F] bg-emerald-50 px-3 py-2.5 text-xs font-bold text-[#556B2F] hover:bg-emerald-100 cursor-pointer disabled:opacity-50"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Reativar Anúncio
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange('VENDIDO')}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1F2937] px-3 py-2.5 text-xs font-bold text-white hover:bg-black cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marcar como Vendido
                  </button>
                )}

                {isPaused ? (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange('PUBLICADO')}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#556B2F] bg-emerald-50 px-3 py-2.5 text-xs font-bold text-[#556B2F] hover:bg-emerald-100 cursor-pointer disabled:opacity-50"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Despausar Anúncio
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => handleStatusChange('PAUSADO')}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer disabled:opacity-50"
                  >
                    <PauseCircle className="h-4 w-4" />
                    Pausar Anúncio
                  </button>
                )}
              </div>
            </div>

            {/* Secção de Edição Completa */}
            <div className="mt-6 border-t border-zinc-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Dados do Anúncio
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#556B2F] hover:underline cursor-pointer"
                >
                  {isEditing ? (
                    <>
                      <X className="h-3.5 w-3.5" /> Cancelar Edição
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3.5 w-3.5" /> Editar Dados do Anúncio
                    </>
                  )}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveFullEdit} className="space-y-3.5 rounded-xl border border-zinc-200 bg-[#F8F7F4] p-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                      Título do Anúncio *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                        Categoria *
                      </label>
                      <select
                        required
                        value={editForm.categoryId}
                        onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                      >
                        <option value="">Selecione...</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                        Condição *
                      </label>
                      <select
                        required
                        value={editForm.condition}
                        onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-xs text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                      >
                        <option value="NOVO">Novo</option>
                        <option value="SEMI_NOVO">Semi-novo</option>
                        <option value="USADO">Usado</option>
                        <option value="DEFEITO_PECAS">Com defeito / Peças</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                        Preço (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                      Bairro ou Região (Opcional)
                    </label>
                    <input
                      type="text"
                      value={editForm.region}
                      onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                      placeholder="Ex: Pelinca, Centro..."
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-zinc-700 mb-1">
                      Descrição do Artigo *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-1/3 rounded-xl border border-zinc-300 bg-white py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="w-2/3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#556B2F] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#445625] cursor-pointer disabled:opacity-50"
                      style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {updating ? 'A guardar alterações...' : 'Guardar Alterações'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-xl border border-zinc-200 bg-[#F8F7F4] p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Condição:</span>
                    <span className="font-bold text-zinc-900">{listing?.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Localização:</span>
                    <span className="font-bold text-zinc-900">{listing?.city} {listing?.region ? `(${listing.region})` : ''}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200">
                    <span className="text-zinc-500 block mb-1">Descrição:</span>
                    <p className="text-zinc-700 line-clamp-3 italic">"{listing?.description}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Zona de Remoção */}
            <div className="mt-8 border-t border-red-100 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                Remover Anúncio
              </h3>
              <p className="text-[11px] text-zinc-500 mb-3">
                Ao excluir o anúncio, ele será apagado do catálogo de forma permanente.
              </p>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'A remover...' : 'Excluir Anúncio Definitivamente'}
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}