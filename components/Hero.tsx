import { companies } from '@/lib/data';
import type { Quote } from '@/lib/quotes';
import type { Theme } from '@/lib/types';
import QuoteBlock from './QuoteBlock';
import StackTiles from './StackTiles';

// Keyed on the mode so the rise animations replay on every transformation.
export default function Hero({ th, modeKey, headShadow, quote }: { th: Theme; modeKey: string; headShadow: string; quote?: Quote }) {
  return (
    <section aria-label="Intro" style={{ flex: '1.2 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div key={modeKey} className="rise" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h1 style={{ margin: 0, fontFamily: th.display, fontWeight: 400, fontSize: th.headSize, lineHeight: 0.95, letterSpacing: th.headTrack, color: th.head, textShadow: headShadow }}>{th.title}</h1>
        <p className="rise2" style={{ margin: 0, maxWidth: 560, fontSize: 18, lineHeight: 1.55, color: th.ink, background: th.subBg, padding: th.subPad, border: th.subBorder }}>{th.sub}</p>
        {quote && <QuoteBlock quote={quote} accent={th.ringColor} ink={th.ink} muted={th.muted} font={th.body} />}
        {!!th.chips.length && (
          <div className="rise3" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {th.chips.map((c) => (
              <span key={c} style={{ padding: '8px 12px', border: th.chipBorder, borderRadius: th.tabRadius, background: th.chipBg, color: th.chipInk, fontSize: 13, fontWeight: 500 }}>{c}</span>
            ))}
          </div>
        )}
        {!!th.stack?.length && <StackTiles th={th} stack={th.stack} />}
        {!!th.links?.length && (
          <div className="rise3" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {th.links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 16px', border: th.tabBorder, borderRadius: th.tabRadius, background: th.tabOnBg, color: th.tabOnInk, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>{l.label} ↗</a>
            ))}
          </div>
        )}
        {modeKey !== 'home' && (
          <div className="rise3" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{ marginRight: 4, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: th.muted }}>Worked with</span>
            {companies.map((c) => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 36, padding: '0 12px', border: th.chipBorder, borderRadius: th.tabRadius, background: th.chipBg, color: th.chipInk, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>{c.label} ↗</a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
