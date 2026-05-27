import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'DZTech Dashboard',
  description: 'Personal dashboard - Notes, Links, Crypto & Calendar',
  manifest: '/manifest.json',
  themeColor: '#0B0F19',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DZTech',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
