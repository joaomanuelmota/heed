// app/layout.js
'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import { useEffect } from 'react';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Páginas que NÃO devem ter sidebar
const pagesWithoutSidebar = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms'
];

function LayoutContent({ children }) {
  const pathname = usePathname();
  const showSidebar = !pagesWithoutSidebar.includes(pathname);

  // Track page views automaticamente
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag && pathname) {
      window.gtag('config', 'G-6CG08B4G2Y', {
        page_path: pathname,
      });
    }
  }, [pathname]);

  if (!showSidebar) {
    // Páginas sem sidebar (login, signup, etc.)
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  // Páginas com sidebar (dashboard, patients, sessions, etc.)
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        {/* Meta tags SEO básicos */}
        <title>Heed - Plataforma de Psicologia Digital</title>
        <meta name="description" content="Plataforma digital para psicólogos gerirem consultas, pacientes e sessões de terapia online. Transforme a sua prática clínica com tecnologia." />
        <meta name="keywords" content="psicologia, terapia online, consultas psicológicas, plataforma digital, gestão clínica, psicólogo" />
        
        {/* Open Graph (Facebook/LinkedIn) */}
        <meta property="og:title" content="Heed - Plataforma de Psicologia Digital" />
        <meta property="og:description" content="Transforme a sua prática clínica com a plataforma digital mais avançada para psicólogos." />
        <meta property="og:url" content="https://myheed.app" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_PT" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Heed - Plataforma de Psicologia Digital" />
        <meta name="twitter:description" content="Transforme a sua prática clínica com tecnologia." />
        
        {/* Robots */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://myheed.app" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-6CG08B4G2Y"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6CG08B4G2Y', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <LayoutContent>
            {children}
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}