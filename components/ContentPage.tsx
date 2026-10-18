import { useState, type CSSProperties, type ReactNode } from 'react';
import type { Page, Theme } from '@/lib/types';
import Cover from './Cover';
import QuoteBlock from './QuoteBlock';
import type { Quote } from '@/lib/quotes';

const PAGE_SIZE = 8;
const SHADOW = '0 1px 3px rgba(0,0,0,0.9), 0 0 18px rgba(0,0,0,0.55)';

const LEGEND = [
  { color: '#7CC6FF', label: 'Video game' },
  { color: '#F2C14E', label: 'Indoor' },
  { color: '#8DE6A3', label: 'Outdoor' },
];

// A card that opens its link in a new tab when it has one.
function Card({ href, className, style, children }: { href?: string; className: string; style: CSSProperties; children: ReactNode }) {
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={{ ...style, color: 'inherit', textDecoration: 'none' }}>{children}</a>
  ) : (
    <div className={className} style={style}>{children}</div>
  );
}

// Fitness / Hobbies / Social, laid out like a profession view (title on top, cards below) straight over the scene.
// No glass panel: cards keep their own dark backing, the intro uses the home sub box and loose text gets a shadow.
export default function ContentPage({ th, pg, quote }: { th: Theme; pg: Page; quote?: Quote }) {
  const now = pg.now;
  const [page, setPage] = useState(0);
  const pages = Math.ceil(pg.items.length / PAGE_SIZE);
  const shown = pg.items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageBtn = (active: boolean): CSSProperties => ({ minWidth: 44, minHeight: 44, padding: '0 14px', borderRadius: 999, border: `1px solid ${active ? pg.accent : 'rgba(255,255,255,0.25)'}`, background: active ? pg.accent : 'rgba(0,0,0,0.45)', color: active ? '#000000' : '#FFFFFF', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 });
  return (
    <section aria-label={pg.title} className="rise" style={{ flex: '1 1 100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: pg.accent, textShadow: SHADOW }}>{pg.kicker}</span>
          <h1 style={{ margin: 0, fontFamily: th.display, fontWeight: 400, fontSize: 'clamp(56px, 8vw, 128px)', lineHeight: 0.95, color: '#FFFFFF', textShadow: SHADOW }}>{pg.title}</h1>
        </div>
      </div>
      <p className="rise2" style={{ alignSelf: 'flex-start', margin: 0, maxWidth: 640, fontSize: 18, lineHeight: 1.55, color: th.ink, background: th.subBg, padding: th.subPad, border: th.subBorder }}>{pg.intro}</p>
      {quote && <QuoteBlock quote={quote} accent={pg.accent} ink={th.ink} muted={th.muted} font={th.body} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Card href={now.href} className="rise2" style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 20, padding: 24, border: `1px solid ${pg.accent}`, borderRadius: 6, background: 'rgba(0,0,0,0.72)', boxShadow: '0 0 40px rgba(139,69,240,0.18)' }}>
          {now.visual && <Cover visual={now.visual} size="lg" accent={pg.accent} />}
          <div style={{ flex: '1 1 260px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: pg.accent }}>{pg.nowLabel}</span>
            <span style={{ fontSize: 12, color: th.muted }}>{now.meta}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: th.display, fontSize: 'clamp(28px, 3.4vw, 44px)', lineHeight: 1.05, color: '#FFFFFF' }}>{now.value}</span>
            {!!now.type && <span style={{ padding: '6px 10px', borderRadius: 999, background: now.typeBg, color: '#000000', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{now.type}</span>}
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: th.ink }}>{now.note}</p>
          {!!now.progress && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: th.muted }}><span>{now.progressLabel}</span><span>{now.progress}</span></div>
              <div aria-hidden="true" style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}><div style={{ height: '100%', width: now.progress, background: pg.accent, borderRadius: 999, transition: 'width 1s cubic-bezier(.2,.8,.2,1)' }}></div></div>
            </div>
          )}
          </div>
        </Card>
        {shown.map((it, i) => (
          <Card key={page * PAGE_SIZE + i} href={it.href} className="rise3" style={{ display: 'flex', flexDirection: it.visual?.kind === 'video' || it.visual?.kind === 'route' ? 'column' : 'row', gap: 14, padding: 20, border: '1px solid rgba(255,255,255,0.18)', borderRadius: 6, background: 'rgba(0,0,0,0.66)' }}>
            {it.visual && <Cover visual={it.visual} size="sm" accent={pg.accent} />}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: th.muted }}>{it.tag}</span>
              {!!it.type && <span style={{ padding: '4px 8px', borderRadius: 999, background: it.typeBg, color: '#000000', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{it.type}</span>}
            </div>
            <span style={{ fontSize: 20, fontWeight: 500, color: '#FFFFFF' }}>{it.title}</span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: th.muted }}>{it.note}</span>
            </div>
          </Card>
        ))}
      </div>
      {pages > 1 && (
        <nav aria-label="Pages" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <button onClick={(e) => { e.stopPropagation(); setPage(page - 1); }} disabled={page === 0} style={{ ...pageBtn(false), opacity: page === 0 ? 0.4 : 1 }}>‹ Prev</button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} aria-current={i === page ? 'page' : undefined} onClick={(e) => { e.stopPropagation(); setPage(i); }} style={pageBtn(i === page)}>{i + 1}</button>
          ))}
          <button onClick={(e) => { e.stopPropagation(); setPage(page + 1); }} disabled={page === pages - 1} style={{ ...pageBtn(false), opacity: page === pages - 1 ? 0.4 : 1 }}>Next ›</button>
          <span style={{ marginLeft: 6, fontSize: 12, color: th.muted, textShadow: SHADOW }}>{page * PAGE_SIZE + 1}–{page * PAGE_SIZE + shown.length} of {pg.items.length}</span>
        </nav>
      )}
      {(!!pg.href || !!pg.links?.length) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {!!pg.href && (
            <a href={pg.href} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 20px', borderRadius: 999, background: pg.accent, color: '#000000', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>{pg.linkLabel} ↗</a>
          )}
          {pg.links?.map((l, i) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 20px', borderRadius: 999, border: `1px solid ${pg.accent}`, background: i === 0 && !pg.href ? pg.accent : 'rgba(0,0,0,0.45)', color: i === 0 && !pg.href ? '#000000' : '#FFFFFF', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>{l.label} ↗</a>
          ))}
        </div>
      )}
      {!!pg.legend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: th.muted, textShadow: SHADOW }}>
          {LEGEND.map((l) => (
            <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: l.color }}></span>{l.label}</span>
          ))}
        </div>
      )}
    </section>
  );
}
