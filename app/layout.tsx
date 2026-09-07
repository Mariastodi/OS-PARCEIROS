import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Os Parceiros — Jogos para jogar junto',
  description: 'Jogos presenciais, rápidos e grátis. Passe o celular e ninguém fica de fora.',
  openGraph: {
    title: 'Os Parceiros — Jogos para jogar junto',
    description: 'Um celular. Todo mundo joga.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Os Parceiros — Um celular. Todo mundo joga.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Os Parceiros — Jogos para jogar junto',
    description: 'Um celular. Todo mundo joga.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
