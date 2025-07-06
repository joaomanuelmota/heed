'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';
import { usePathname } from 'next/navigation';
import Sidebar from '../components/Sidebar';

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
  '/reset-password'
];

function LayoutContent({ children }) {
  const pathname = usePathname();
  const showSidebar = !pagesWithoutSidebar.includes(pathname);

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LayoutContent>
            {children}
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}