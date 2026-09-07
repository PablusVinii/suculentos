import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWAInstaller } from '@/components/common/PWAInstaller';

export const metadata: Metadata = {
  title: 'Suculentos Pastelaria | Monte do seu jeito',
  description:
    'Pastéis com massa fresca e super crocante, fritos na hora com recheios generosos, salgados deliciosos e bebidas geladas. Faça seu pedido online ou no totem!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Suculentos',
  },
  applicationName: 'Suculentos',
  keywords: ['pastel', 'pastelaria', 'suculentos', 'massa fresca', 'comanda', 'totem', 'delivery', 'lanche', 'pwa', 'app'],
  authors: [{ name: 'Suculentos Pastelaria' }],
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192' },
      { url: '/apple-touch-icon.png', sizes: '192x192' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#d97706',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Suculentos" />
        <meta name="theme-color" content="#d97706" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-stone-50 flex flex-col antialiased">
        {children}
        <PWAInstaller />
      </body>
    </html>
  );
}
