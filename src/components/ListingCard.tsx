import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Tag } from 'lucide-react';

interface ListingProps {
  id: string;
  title: string;
  price: number;
  condition: string;
  city: string;
  region?: string | null;
  status: string;
  category_name: string;
  primary_image?: string | null;
}

export function ListingCard({ item }: { item: ListingProps }) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(item.price);

  const isSold = item.status === 'VENDIDO';
  const isPaused = item.status === 'PAUSADO';

  if (isPaused) return null;

  // Formatação do badge de condição (ex.: "Novo" ou "Usado" com estilo oval)
  const conditionLabel =
    item.condition === 'NOVO'
      ? 'Novo'
      : item.condition === 'SEMI_NOVO'
      ? 'Semi-novo'
      : item.condition === 'DEFEITO_PECAS'
      ? 'Peças'
      : 'Usado';

  return (
    <Link
      href={`/anuncios/${item.id}`}
      className={`group flex flex-col overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-xs transition hover:shadow-md hover:-translate-y-0.5 ${
        isSold ? 'opacity-70' : ''
      }`}
    >
      {/* Moldura da Fotografia com fundo neutro suave */}
      <div className="relative aspect-4/3 w-full bg-[#EAE7E0]/60 overflow-hidden flex items-center justify-center p-1">
        {item.primary_image ? (
          <div className="relative h-full w-full">
            <Image
              src={item.primary_image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105 ${
                isSold ? 'grayscale' : ''
              }`}
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <Tag className="h-8 w-8 opacity-30" />
          </div>
        )}

        {/* Badge Oval da Condição idêntico à maquete */}
        <span className="absolute right-2.5 top-2.5 rounded-full bg-[#1F2937]/85 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
          {conditionLabel}
        </span>

        {/* Badge de Vendido */}
        {isSold && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-red-700 px-2.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider shadow-sm">
            Vendido
          </span>
        )}
      </div>

      {/* Conteúdo do Cartão */}
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-1 text-sm font-bold text-[#1F2937] group-hover:text-[#556B2F] transition">
          {item.title}
        </h3>

        <p className="mt-1.5 text-base font-extrabold text-[#556B2F]">
          {formattedPrice}
        </p>

        <div className="mt-auto pt-2.5 flex items-center gap-1 text-[11px] text-zinc-500 border-t border-zinc-100">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#556B2F]" />
          <span className="truncate">
            {item.city} {item.region ? `- ${item.region}` : ''}
          </span>
        </div>
      </div>
    </Link>
  );
}