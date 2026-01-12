import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'nFKs Pay',
  description: 'Secure Payment Gateway for AyScroll',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'nFKs Pay',
    description: 'Secure, fast, and reliable payment gateway for AyScroll services.',
    url: 'https://ayscroll.com',
    siteName: 'nFKs Pay',
    images: [
      {
        url: '/nfks_logo.png',
        width: 800,
        height: 600,
        alt: 'nFKs Pay Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'nFKs Pay',
    description: 'Secure Payment Gateway for AyScroll',
    images: ['/nfks_logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
