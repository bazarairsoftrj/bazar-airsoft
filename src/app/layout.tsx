import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  title: "Bazar Airsoft | Equipamentos de Airsoft em um só lugar",
  description: "Classificados da comunidade de Airsoft. Compre, venda e conecte-se com outros operadores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${bebas.variable}`}>
      <body className="bg-offwhite text-carvao font-inter antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}