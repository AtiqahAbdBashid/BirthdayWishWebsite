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
      <body className={inter.className}>
        <MusicProvider> {/* MUST be here */}
          {children}
        </MusicProvider>
      </body>
    </html>
  );
}