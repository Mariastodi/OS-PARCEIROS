import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Os Parceiros',
  description: 'Jogue O Impostor com salas por PIN ou passando o celular. Palavras em português e papéis secretos.',
  openGraph: {
    title: 'Os Parceiros',
    description: 'Uma sala. Todo mundo joga.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Os Parceiros — Uma sala. Todo mundo joga.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Os Parceiros',
    description: 'Uma sala. Todo mundo joga.',
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
