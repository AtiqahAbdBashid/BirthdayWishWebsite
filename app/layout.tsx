import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MusicProvider } from '@/context/MusicContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Happy Birthday Lynda! 🎂',
  description: 'A special birthday surprise for Lynda',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <MusicProvider>
          {children}
        </MusicProvider>
      </body>
    </html>
  );
}