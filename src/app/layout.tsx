import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Suculentos Pastelaria | Monte do seu jeito',
  description:
    'Pastéis com massa fresca e super crocante, fritos na hora com recheios generosos, salgados deliciosos e bebidas geladas. Faça seu pedido online ou no totem!',
  keywords: ['pastel', 'pastelaria', 'suculentos', 'massa fresca', 'comanda', 'totem', 'delivery', 'lanche'],
  authors: [{ name: 'Suculentos Pastelaria' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥟</text></svg>"
        />
      </head>
      <body className="min-h-screen bg-stone-50 flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
