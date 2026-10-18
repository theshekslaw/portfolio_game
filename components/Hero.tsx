import type { Theme } from '@/lib/types';

// Keyed on the mode so the rise animations replay on every transformation.
export default function Hero({ th, modeKey, headShadow }: { th: Theme; modeKey: string; headShadow: string }) {
  return (
    <section aria-label="Intro" style={{ flex: '1.2 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div key={modeKey} className="rise" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 style={{ margin: 0, fontFamily: th.display, fontWeight: 400, fontSize: th.headSize, lineHeight: 0.95, letterSpacing: th.headTrack, color: th.head, textShadow: headShadow }}>{th.title}</h1>
        <p className="rise2" style={{ margin: 0, maxWidth: 560, fontSize: 18, lineHeight: 1.55, color: th.ink, background: th.subBg, padding: th.subPad, border: th.subBorder }}>{th.sub}</p>
        <div className="rise3" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {th.chips.map((c) => (
            <span key={c} style={{ padding: '8px 12px', border: th.chipBorder, borderRadius: th.tabRadius, background: th.chipBg, color: th.chipInk, fontSize: 13, fontWeight: 500 }}>{c}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
