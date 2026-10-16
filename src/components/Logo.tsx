import Link from 'next/link';
import Image from 'next/image';

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
      <div className="relative h-11 w-11 shrink-0">
        <Image
          src="/icons/logo.png"
          alt="Bazar Airsoft Logo"
          width={44}
          height={44}
          className="object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>

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