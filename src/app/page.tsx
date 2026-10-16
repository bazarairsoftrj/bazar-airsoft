'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ListingCard } from '@/components/ListingCard';
import { Search, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Mapeamento dos ícones manuais da pasta public/icons/
const CATEGORY_ICONS: Record<string, string> = {
  'rifles-aegs': '/icons/rifles.png',
  'pistolas': '/icons/pistolas.png',
  'equipamentos-protecao': '/icons/protecao.png',
  'acessorios': '/icons/acessorios.png',
  'municoes': '/icons/municoes.png',
  'diversos': '/icons/diversos.png',
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get('busca') || '';
  const categoriaSlugParam = searchParams.get('categoria') || '';

  const [categories, setCategories] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // 1. Carregar Categorias
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('sort_order', { ascending: true });

      if (catData) setCategories(catData);

      // 2. Carregar Anúncios
      let query = supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          condition,
          city,
          region,
          status,
          categories ( name, slug ),
          listing_images ( public_url, sort_order )
        `)
        .in('status', ['PUBLICADO', 'RESERVADO', 'VENDIDO'])
        .order('published_at', { ascending: false });

      if (categoriaSlugParam && catData) {
        const found = catData.find((c) => c.slug === categoriaSlugParam);
        if (found) {
          query = query.eq('category_id', found.id);
        }
      }

      const { data: items } = await query;

      let filtered = items || [];
      if (buscaParam) {
        const termo = normalizeSearchText(buscaParam);
        filtered = filtered.filter((item: any) => {
          const t = normalizeSearchText(item.title || '');
          const d = normalizeSearchText(item.description || '');
          const c = normalizeSearchText(item.city || '');
          const cat = normalizeSearchText(item.categories?.name || '');
          return t.includes(termo) || d.includes(termo) || c.includes(termo) || cat.includes(termo);
        });
      }

      setListings(filtered);
      setLoading(false);
    }

    loadData();
  }, [buscaParam, categoriaSlugParam]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col justify-between">
      <div>
        <Header />

        {/* HERO BANNER - Puxa sua imagem de public/images/hero-bg.jpg */}
        <div
          className="relative border-b border-zinc-900 bg-[#1F2937] py-16 px-4 text-white text-center sm:py-24 bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(31, 41, 55, 0.82), rgba(15, 23, 42, 0.94)), url('/images/hero-bg.jpg')`,
          }}
        >
          <div className="mx-auto max-w-3xl relative z-10">
            <h1 className="font-bebas text-4xl sm:text-6xl tracking-wider uppercase leading-none drop-shadow-md">
              EQUIPAMENTOS DE AIRSOFT EM UM SÓ LUGAR.
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#D7C9A8] font-medium tracking-wide">
              Compre, venda e conecte-se com outros jogadores.
            </p>

            {/* Barra de Pesquisa */}
            <form
              method="GET"
              action="/#catalogo"
              className="relative mt-8 flex items-center shadow-2xl rounded-2xl overflow-hidden max-w-2xl mx-auto border border-zinc-700/60 bg-white"
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  name="busca"
                  defaultValue={buscaParam}
                  placeholder="Buscar por produto, categoria ou palavra-chave..."
                  className="w-full bg-white py-3.5 pl-12 pr-4 text-sm text-[#1F2937] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-[#556B2F] px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#445625] cursor-pointer"
                style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
              >
                Buscar
              </button>
            </form>
          </div>
        </div>

        <main className="mx-auto max-w-6xl px-4 py-10" id="catalogo">
          {/* CATEGORIAS LIMPAS E TRANSPARENTES (SEM RETÂNGULOS/BORDAS) */}
          <section className="mb-12" id="categorias">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat) => {
                const isSelected = categoriaSlugParam === cat.slug;
                const iconPath = CATEGORY_ICONS[cat.slug];

                return (
                  <Link
                    key={cat.id}
                    href={`/?categoria=${cat.slug}${buscaParam ? `&busca=${buscaParam}` : ''}#catalogo`}
                    className="flex flex-col items-center justify-center p-2 text-center group transition cursor-pointer select-none"
                  >
                    {/* Apenas o ícone livre e transparente */}
                    <div className="relative flex h-14 w-14 items-center justify-center transition-transform duration-200 group-hover:-translate-y-1">
                      {iconPath ? (
                        <Image
                          src={iconPath}
                          alt={cat.name}
                          width={44}
                          height={44}
                          className={`object-contain transition-opacity duration-200 ${
                            isSelected ? 'opacity-100 scale-105' : 'opacity-85 group-hover:opacity-100'
                          }`}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Layers className={`h-8 w-8 transition-colors ${isSelected ? 'text-[#556B2F]' : 'text-zinc-600 group-hover:text-[#556B2F]'}`} />
                      )}
                    </div>

                    {/* Nome da categoria abaixo do ícone */}
                    <span
                      className={`mt-2 text-xs font-bold leading-tight transition-colors ${
                        isSelected
                          ? 'text-[#556B2F]'
                          : 'text-[#1F2937] group-hover:text-[#556B2F]'
                      }`}
                    >
                      {cat.name}
                    </span>

                    {/* Indicador sutil e limpo quando ativo */}
                    {isSelected && (
                      <span className="mt-1 h-1 w-6 rounded-full bg-[#556B2F]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {categoriaSlugParam && (
              <div className="mt-4 text-center">
                <Link
                  href="/#catalogo"
                  className="text-xs font-bold text-[#556B2F] underline hover:text-[#445625]"
                >
                  ✕ Limpar filtro de categoria
                </Link>
              </div>
            )}
          </section>

          {/* TÍTULO DOS ANÚNCIOS */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bebas text-3xl tracking-wide uppercase text-[#1F2937]">
                {categoriaSlugParam ? 'Resultados Filtrados' : 'Anúncios recentes'}
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs font-bold text-[#556B2F] hover:text-[#445625] transition flex items-center gap-1"
            >
              Ver todos →
            </Link>
          </div>

          {/* LISTA DE ANÚNCIOS */}
          {loading ? (
            <div className="py-16 text-center text-xs text-zinc-500">
              Carregando classificados...
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 md:gap-5">
              {listings.map((item: any) => (
                <ListingCard
                  key={item.id}
                  item={{
                    id: item.id,
                    title: item.title,
                    price: Number(item.price),
                    condition: item.condition,
                    city: item.city,
                    region: item.region,
                    status: item.status,
                    category_name: item.categories?.name || 'Geral',
                    primary_image: item.listing_images?.[0]?.public_url || null,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="my-16 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
              <p className="text-sm font-semibold text-zinc-600">
                Nenhum anúncio encontrado para a pesquisa pretendida.
              </p>
              <Link
                href="/#catalogo"
                className="mt-3 inline-block rounded-xl bg-[#556B2F] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: '#556B2F', color: '#FFFFFF' }}
              >
                Ver todos os anúncios
              </Link>
            </div>
          )}

          {/* BANNER COMUNITÁRIO - Puxa sua imagem de public/images/community-banner.jpg */}
          <section className="mt-16 overflow-hidden rounded-2xl border border-zinc-900 shadow-md">
            <div
              className="relative p-8 sm:p-12 text-white bg-cover bg-center flex flex-col justify-center min-h-[220px]"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(31, 41, 55, 0.95) 30%, rgba(31, 41, 55, 0.45)), url('/images/community-banner.jpg')`,
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D7C9A8]">
                ESTILO VISUAL • BAZAR AIRSOFT
              </span>
              <h3 className="font-bebas text-3xl sm:text-5xl tracking-wide uppercase mt-1 leading-none">
                Mais que equipamentos, uma comunidade.
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-zinc-300 max-w-md">
                Junte-se a operadores locais em Campos dos Goytacazes e região. Negocie com segurança e respeito ao esporte.
              </p>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}