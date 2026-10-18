import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

// Link-preview card (LinkedIn, X, WhatsApp, Slack…): the Shrine look — black / violet split, Pirata One name,
// Space Grotesk for the rest. Both fonts are OFL-licensed and kept in assets/ so the image renders the same everywhere.
export const alt = 'Abhishek Pandey — Software Engineer building production AI/ML solutions';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const COMPASS = 'M15 2 L17 9 L15 11 L13 9 Z M28 15 L21 17 L19 15 L21 13 Z M15 28 L13 21 L15 19 L17 21 Z M2 15 L9 13 L11 15 L9 17 Z';

export default async function Image() {
  const [pirata, grotesk] = await Promise.all([
    readFile(join(process.cwd(), 'assets/PirataOne-Regular.ttf')),
    readFile(join(process.cwd(), 'assets/SpaceGrotesk-Medium.ttf')),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#000000', color: '#EDE6FF', fontFamily: 'Space Grotesk' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 24, letterSpacing: 6, color: '#B9A3E8' }}>
            <svg width="40" height="40" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="none" stroke="#B98CFF" strokeWidth="2" /><circle cx="15" cy="15" r="4" fill="#B98CFF" /><path d={COMPASS} fill="#B98CFF" /></svg>
            THESHEKSLAW
          </div>
          <div style={{ fontFamily: 'Pirata One', fontSize: 132, lineHeight: 0.95, color: '#FFFFFF', textShadow: '0 0 30px rgba(139,69,240,0.75)' }}>Abhishek Pandey</div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 34, lineHeight: 1.35 }}>
            <span>Software Engineer building</span>
            <span>production AI/ML solutions</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {['LLM fine-tuning', 'RAG', 'Model serving', 'MLOps'].map((c) => (
              <div key={c} style={{ display: 'flex', padding: '8px 18px', border: '2px solid rgba(139,69,240,0.8)', borderRadius: 999, fontSize: 22, color: '#EDE6FF' }}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ width: 330, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#8B45F0' }}>
          <svg width="230" height="230" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="none" stroke="#000000" strokeWidth="1.6" /><circle cx="15" cy="15" r="4" fill="#000000" /><path d={COMPASS} fill="#000000" /></svg>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Space Grotesk', data: grotesk, style: 'normal', weight: 500 },
        { name: 'Pirata One', data: pirata, style: 'normal', weight: 400 },
      ],
    },
  );
}
