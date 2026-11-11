'use client';

import { usePathname } from 'next/navigation';
import Providers from './Providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import '@/i18n/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
import './globals.css';

function LayoutContent({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return children;

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '76px', minHeight: 'calc(100vh - 60px)' }}>{children}</main>
      <Footer />
      <ChatbotWidget />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Arsalan Jaffri — full-stack software engineer at Jaffri's Tech Solutions. Web, mobile and AI products built for real operations." />
        <meta name="theme-color" content="#0a0a0f" />
        <link rel="icon" type="image/png" href="/brand/logo-icon-dark.png" />
        <link rel="apple-touch-icon" href="/brand/logo-icon-dark.png" />
        <title>Jaffri&apos;s Tech Solutions | Arsalan Jaffri</title>
      </head>
      <body style={{ margin: 0 }}>
        <Providers>
          <LayoutContent>{children}</LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
