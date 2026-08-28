import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'Fuel Tracker — Mileage, Gas & Engine Maintenance',
  description: 'Vehicle fuel economy, distance-to-empty gauge tracking, trip odometer logs, predictive fuel calculators, and maintenance schedule manager.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#050505] text-[#e0e0e0] antialiased selection:bg-orange-500/30 selection:text-orange-300 font-sans">
        {children}
      </body>
    </html>
  );
}
