import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { FamilyProvider } from '@/context/FamilyContext';
import Navbar from '@/components/Navbar';
import PageTransition from '@/components/PageTransition';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SehatFile — Modern Family Health Folder & Doctor's Brief",
  description:
    'The smart digital health folder for Indian families. Photograph medical lab reports once — keep a living timeline, medicine list, and 1-page printable doctor briefs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen bg-[#faf9f5] text-stone-900 antialiased selection:bg-stone-900 selection:text-white flex flex-col justify-between">
        <FamilyProvider>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 border-t border-stone-200 text-xs text-stone-400 no-print flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-stone-900 font-display">SehatFile</span>
              <span className="text-stone-300">•</span>
              <span className="font-serif-accent text-sm text-stone-600">Built for a Friend</span>
              <span className="text-stone-300">•</span>
              <span>Hacktoberfest 2026</span>
            </div>
            <div className="font-mono text-[11px] text-stone-500">
              [00] Zero-Cloud On-Device Architecture
            </div>
          </footer>
        </FamilyProvider>
      </body>
    </html>
  );
}
