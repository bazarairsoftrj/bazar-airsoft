'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  getAdminDashboardData,
  adminUpdateListingStatus,
  adminDeleteListing,
  adminUpdateReportStatus,
  adminGenerateSellerManageLink,
  adminResolveRecoveryRequest,
} from '@/app/actions/adminActions';
import { verifyAdminSession, logoutAdminAction } from '@/app/actions/authActions';
import {
  Shield,
  CheckCircle,
  Trash2,
  Eye,
  RefreshCw,
  Play,
  Pause,
  MessageCircle,
  LogOut,
  BellRing,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recuperacoes' | 'denuncias' | 'anuncios'>('recuperacoes');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    verifyAdminSession().then((isAuth) => {
      if (!isAuth) {
        window.location.href = '/admin/login';
      } else {
        setAuthorized(true);
        loadDashboard();
      }
    });
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    const res = await getAdminDashboardData();
    if (!res.error) {
      setData(res);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setProcessingId(id);
    await adminUpdateListingStatus(id, status);
    setProcessingId(null);
    loadDashboard();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem a certeza de que deseja remover este anúncio definitivamente?')) {
      setProcessingId(id);
      await adminDeleteListing(id);
      setProcessingId(null);
      loadDashboard();
    }
  };

  const handleResolveReport = async (reportId: string) => {
    setProcessingId(reportId);
    const res = await adminUpdateReportStatus(reportId, 'RESOLVIDO');
    setProcessingId(null);

    if (res.error) {
      alert(res.error);
    } else {
      loadDashboard();
    }
  };

  const handleSendManageLinkToSeller = async (listingId: string, phone: string, title: string, recoveryId?: string) => {
    setProcessingId(listingId);
    const res = await adminGenerateSellerManageLink(listingId);
    setProcessingId(null);

    if (res.error) {
      alert('Erro ao gerar link: ' + res.error);
      return;
    }

    if (recoveryId) {
      await adminResolveRecoveryRequest(recoveryId);
      loadDashboard();
    }

    const manageUrl = `${window.location.origin}/gerenciar/${res.manageToken}`;
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá! Aqui está o seu link privado para gerir o anúncio "${title}" no Bazar Airsoft:\n\n${manageUrl}\n\nGuarde este link para alterar o preço ou marcar o artigo como vendido.`
    );

    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

  const handleLogout = async () => {
    await logoutAdminAction();
    window.location.href = '/admin/login';
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center text-xs text-zinc-500">
        A verificar credenciais...
      </div>
    );
  }

  const pendingRecoveriesCount = data?.metrics?.pendingRecoveries || 0;

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
      <div>
        <Header />

        <main className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1F2937] text-white">
                <Shield className="h-5 w-5 text-[#D7C9A8]" />
              </div>
              <div>
                <h1 className="font-bebas text-2xl tracking-wide uppercase text-[#1F2937]">
                  Painel de Moderação
                </h1>
                <p className="text-xs text-zinc-500">Controlo de solicitações, denúncias e classificados</p>
              </div>
            </div>

            <div className="mt-3 sm:mt-0 flex items-center gap-2">
              <button
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Atualizar
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Sair
              </button>
            </div>
          </div>

          {/* Banner de Notificação se houver pedidos de recuperação */}
          {pendingRecoveriesCount > 0 && (
            <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-amber-900">
                  <BellRing className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    Atenção: {pendingRecoveriesCount} novo(s) pedido(s) de recuperação de link!
                  </h3>
                  <p className="text-xs text-amber-800">
                    Vendedores solicitaram o reenvio de acesso aos seus anúncios.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('recuperacoes')}
                className="rounded-xl bg-[#556B2F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#445625] cursor-pointer"
                style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
              >
                Ver Pedidos
              </button>
            </div>
          )}

          {/* Cards de Métricas */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Pedidos de Link</span>
              <p className="mt-1 text-2xl font-black text-amber-900">{pendingRecoveriesCount}</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#556B2F]">Ativos na Montra</span>
              <p className="mt-1 text-2xl font-black text-[#556B2F]">{data?.metrics?.activeListings || 0}</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Itens Vendidos</span>
              <p className="mt-1 text-2xl font-black text-zinc-700">{data?.metrics?.soldListings || 0}</p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Denúncias</span>
              <p className="mt-1 text-2xl font-black text-red-600">{data?.metrics?.pendingReports || 0}</p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-2 border-b border-zinc-200 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('recuperacoes')}
              className={`rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition flex items-center gap-1.5 ${
                activeTab === 'recuperacoes'
                  ? 'bg-[#1F2937] text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <span>Pedidos de Link</span>
              {pendingRecoveriesCount > 0 && (
                <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-black">
                  {pendingRecoveriesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('denuncias')}
              className={`rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition ${
                activeTab === 'denuncias'
                  ? 'bg-[#1F2937] text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              Fila de Denúncias ({data?.reports?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('anuncios')}
              className={`rounded-xl px-4 py-2 text-xs font-bold cursor-pointer transition ${
                activeTab === 'anuncios'
                  ? 'bg-[#1F2937] text-white shadow-xs'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              Todos os Anúncios ({data?.listings?.length || 0})
            </button>
          </div>

          {/* Conteúdo Aba Solicitações de Recuperação */}
          {activeTab === 'recuperacoes' && (
            <div className="space-y-3">
              {data?.recoveries && data.recoveries.length > 0 ? (
                data.recoveries.map((rec: any) => (
                  <div
                    key={rec.id}
                    className="rounded-2xl border border-amber-200 bg-white p-4.5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                          Recuperação de Acesso
                        </span>
                        <span className="text-xs text-zinc-400">
                          {new Date(rec.created_at).toLocaleDateString('pt-BR')} às {new Date(rec.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#1F2937]">
                        Anúncio: {rec.listings?.title || '(Artigo removido)'}
                      </h3>
                      <p className="text-xs text-zinc-600">
                        Vendedor: <strong>{rec.listings?.seller_contacts?.display_name}</strong> • WhatsApp Solicitante: <strong>{rec.phone}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSendManageLinkToSeller(rec.listings.id, rec.phone, rec.listings.title, rec.id)}
                        disabled={processingId === rec.listings.id}
                        className="flex items-center gap-1.5 rounded-xl bg-[#556B2F] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#445625] cursor-pointer shadow-xs disabled:opacity-50"
                        style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Reenviar Link Seguro via WhatsApp
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-zinc-500">
                  Nenhum pedido de recuperação de link pendente.
                </div>
              )}
            </div>
          )}

          {/* Conteúdo Aba Denúncias */}
          {activeTab === 'denuncias' && (
            <div className="space-y-3">
              {data?.reports && data.reports.length > 0 ? (
                data.reports.map((rep: any) => (
                  <div
                    key={rep.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4.5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                          {rep.reason}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {new Date(rep.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-[#1F2937]">
                        Anúncio: {rep.listings?.title || '(Removido da base)'}
                      </p>
                      {rep.details && (
                        <p className="text-xs text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                          "{rep.details}"
                        </p>
                      )}
                      {rep.seller_phone && (
                        <p className="text-[11px] text-zinc-500">
                          Vendedor: {rep.listings?.seller_contacts?.display_name} • WhatsApp: {rep.seller_phone}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {rep.listings && (
                        <>
                          <Link
                            href={`/anuncios/${rep.listings.id}`}
                            target="_blank"
                            className="flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                          >
                            <Eye className="h-3.5 w-3.5" /> Ver
                          </Link>

                          <button
                            onClick={() => handleDelete(rep.listings.id)}
                            disabled={processingId === rep.listings.id}
                            className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Excluir Anúncio
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        disabled={processingId === rep.id}
                        className="flex items-center gap-1 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> {processingId === rep.id ? 'A concluir...' : 'Concluir'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-zinc-500">
                  Nenhuma denúncia pendente no momento.
                </div>
              )}
            </div>
          )}

          {/* Conteúdo Aba Anúncios */}
          {activeTab === 'anuncios' && (
            <div className="space-y-3">
              {data?.listings && data.listings.length > 0 ? (
                data.listings.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase text-[#556B2F]">
                          {item.categories?.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            item.status === 'PUBLICADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'VENDIDO'
                              ? 'bg-zinc-800 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#1F2937] mt-0.5">{item.title}</h3>
                      <p className="text-xs text-zinc-500">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)} • {item.city} • Vendedor: {item.seller_contacts?.display_name} ({item.seller_phone})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/anuncios/${item.id}`}
                        target="_blank"
                        className="flex items-center gap-1 rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                      >
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </Link>

                      {item.seller_phone && (
                        <button
                          onClick={() => handleSendManageLinkToSeller(item.id, item.seller_phone, item.title)}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer disabled:opacity-50"
                          title="Enviar link de controlo ao vendedor via WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-700" /> Reenviar Link
                        </button>
                      )}

                      {item.status === 'PUBLICADO' ? (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'PAUSADO')}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer disabled:opacity-50"
                        >
                          <Pause className="h-3.5 w-3.5" /> Pausar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'PUBLICADO')}
                          disabled={processingId === item.id}
                          className="flex items-center gap-1 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 cursor-pointer disabled:opacity-50"
                        >
                          <Play className="h-3.5 w-3.5" /> Ativar
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={processingId === item.id}
                        className="flex items-center gap-1 rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100 cursor-pointer disabled:opacity-50"
                        title="Excluir Anúncio Definitivamente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-zinc-500">
                  Nenhum anúncio registado no catálogo.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}