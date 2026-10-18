import type { Metadata } from 'next';
import './globals.css';

const DESCRIPTION = 'Software Engineer building production AI/ML solutions: LLM fine-tuning, RAG and model serving. My work, reading list and training, live.';
// Absolute URLs for link previews: Vercel provides the production domain; localhost otherwise.
const SITE = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Abhishek Pandey — Software Engineer (AI/ML)',
  description: DESCRIPTION,
  openGraph: { type: 'website', siteName: 'theshekslaw', title: 'Abhishek Pandey — Software Engineer (AI/ML)', description: DESCRIPTION, url: '/' },
  twitter: { card: 'summary_large_image', title: 'Abhishek Pandey — Software Engineer (AI/ML)', description: DESCRIPTION },
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
