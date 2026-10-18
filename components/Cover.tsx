import type { Visual } from '@/lib/types';

const SIZES = { sm: { w: 64, h: 92, font: 7.5 }, lg: { w: 104, h: 150, font: 11 } };

// A card image: book cover / video thumbnail / run route, or a generated cover (a paper's first page, a plain book jacket)
// when there is no image to show.
export default function Cover({ visual, size, accent }: { visual: Visual; size: 'sm' | 'lg'; accent: string }) {
  if (visual.kind === 'route') {
    return visual.path ? (
      <svg viewBox="0 0 160 90" aria-hidden="true" style={{ display: 'block', width: size === 'lg' ? 'min(320px, 100%)' : '100%', aspectRatio: '16 / 9', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <path d={visual.path} fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={visual.path.split(/[ML ]/).filter(Boolean)[0]} cy={visual.path.split(/[ML ]/).filter(Boolean)[1]} r="3" fill="#FFFFFF" />
      </svg>
    ) : null;
  }
  if (visual.kind === 'video') {
    return visual.src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={visual.src} alt="" loading="lazy" style={{ display: 'block', width: size === 'lg' ? 'min(320px, 100%)' : '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(255,255,255,0.18)' }} />
    ) : null;
  }
  const { w, h, font } = SIZES[size];
  const box = { flex: 'none', width: w, height: h, borderRadius: 3, boxShadow: '0 6px 18px rgba(0,0,0,0.45)', overflow: 'hidden' } as const;
  if (visual.src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={visual.src} alt="" loading="lazy" style={{ ...box, display: 'block', objectFit: 'cover', background: '#222' }} />;
  }
  const paper = visual.kind === 'paper';
  return (
    <div aria-hidden="true" style={{ ...box, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: font * 0.6, padding: font * 0.9, background: paper ? '#F6F3EA' : `linear-gradient(160deg, ${accent}, #1A1A1A 85%)`, color: paper ? '#1B1B1B' : '#FFFFFF', borderLeft: paper ? undefined : `${Math.round(font * 0.6)}px solid rgba(0,0,0,0.35)` }}>
      {paper && <div style={{ height: 2, background: '#B31B1B' }} />}
      <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: font, lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{visual.title}</span>
      <span style={{ marginTop: 'auto', fontSize: font * 0.8, lineHeight: 1.2, opacity: 0.75 }}>{visual.caption}</span>
      {paper && Array.from({ length: 3 }, (_, i) => <div key={i} style={{ height: 1.5, width: `${90 - i * 18}%`, background: 'rgba(0,0,0,0.18)' }} />)}
    </div>
  );
}
