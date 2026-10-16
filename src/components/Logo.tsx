import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
}

export function Logo({ variant = 'dark', showSubtitle = true }: LogoProps) {
  const isLight = variant === 'light';
  const textColor = isLight ? '#FFFFFF' : '#1F2937';
  const subColor = isLight ? '#D7C9A8' : '#556B2F';

  return (
    <Link href="/" className="inline-flex items-center gap-3 group">
      {/* Emblema Gráfico Oficial em SVG */}
      <svg
        className="h-10 w-12 shrink-0 transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 140 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Contorno da Montanha Externa */}
        <path
          d="M10 88L65 14L88 48L106 28L130 88H10Z"
          fill="#556B2F"
        />
        {/* Camada Interna Clara / Recorte */}
        <path
          d="M26 84L65 26L84 54L104 36L122 84H26Z"
          fill="#F8F7F4"
        />
        {/* Faixa Angular de Destaque Laranja */}
        <polygon
          points="8,92 50,78 44,72 5,84"
          fill="#F97316"
        />
        {/* Silhueta do Operador com Réplica */}
        <path
          d="M58 84C58 75 62 70 67 66C66 64 65 61 65 58C65 52 69 47 74 47C78 47 82 51 82 57C82 60 81 63 80 65C85 68 89 74 90 84H58Z"
          fill="#1F2937"
        />
        {/* Réplica de Airsoft na Mão do Operador */}
        <path
          d="M74 65L96 66L102 63V61L94 62L82 61L74 65Z"
          fill="#1F2937"
        />
        {/* Cano da Réplica */}
        <rect
          x="94"
          y="62.5"
          width="18"
          height="2.5"
          rx="1"
          fill="#1F2937"
        />
        {/* Ponta Laranja da Réplica */}
        <rect
          x="108"
          y="62"
          width="5"
          height="3.5"
          rx="0.5"
          fill="#F97316"
        />
      </svg>

      {/* Tipografia da Marca */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className="font-bebas text-2xl sm:text-3xl tracking-wide uppercase leading-none"
          style={{ color: textColor }}
        >
          BAZAR AIRSOFT
        </span>
        {showSubtitle && (
          <span
            className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] mt-0.5"
            style={{ color: subColor }}
          >
            COMPRA • VENDE • CONECTA
          </span>
        )}
      </div>
    </Link>
  );
}