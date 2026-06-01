import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mundial 2026 · Simulador de resultados',
  description: 'Calendario, grupos y eliminatorias del Mundial 2026 en horario de Monterrey.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
