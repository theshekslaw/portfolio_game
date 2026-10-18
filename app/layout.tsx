import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Power Modes portfolio',
  description: 'Shek: engineer by profession, fighter by habit, reader by night.',
};

// Fonts load from the exact Google Fonts URL in docs/handoff/fonts.txt. next/font is not used because it renames
// families, and the canvas scenes and theme tokens refer to fonts by their real names ('Bangers', 'Anton', ...).
const FONTS =
  'https://fonts.googleapis.com/css2?family=Pirata+One&family=Geist+Mono:wght@400;500&family=Dela+Gothic+One&family=Yatra+One&family=Bangers&family=Zen+Kaku+Gothic+New:wght@400;700&family=Rubik+Glitch&family=Rubik:wght@400;500;700&family=Cinzel:wght@600;700&family=Marcellus&family=Silkscreen:wght@400;700&family=IBM+Plex+Mono:wght@400;500&family=Anton&family=Orbitron:wght@600;800&family=Press+Start+2P&family=Fraunces:ital,wght@0,600;1,400&family=Space+Grotesk:wght@500;700&display=swap';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href={FONTS} rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
