import type { Page, Theme } from '@/lib/types';

const LEGEND = [
  { color: '#7CC6FF', label: 'Video game' },
  { color: '#F2C14E', label: 'Indoor' },
  { color: '#8DE6A3', label: 'Outdoor' },
];

// Fitness / Hobbies / Social: a frosted-glass panel so the copy stays legible over the pattern scenes.
export default function ContentPage({ th, pg }: { th: Theme; pg: Page }) {
  const now = pg.now;
  return (
    <section aria-label={pg.title} className="rise" style={{ flex: '1 1 100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100, padding: 'clamp(20px, 3vw, 36px)', borderRadius: 10, background: 'rgba(8,8,10,0.72)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: pg.accent }}>{pg.kicker}</span>
          <h1 style={{ margin: 0, fontFamily: th.display, fontWeight: 400, fontSize: 'clamp(56px, 8vw, 128px)', lineHeight: 0.95, color: '#FFFFFF' }}>{pg.title}</h1>
        </div>
      </div>
      <p style={{ margin: 0, maxWidth: 640, fontSize: 18, lineHeight: 1.55, color: th.ink }}>{pg.intro}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div className="rise2" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 14, padding: 24, border: `1px solid ${pg.accent}`, borderRadius: 6, background: 'rgba(0,0,0,0.6)', boxShadow: '0 0 40px rgba(139,69,240,0.18)' }}>
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
        {pg.items.map((it, i) => (
          <div key={i} className="rise3" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20, border: '1px solid rgba(255,255,255,0.18)', borderRadius: 6, background: 'rgba(0,0,0,0.45)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: th.muted }}>{it.tag}</span>
              {!!it.type && <span style={{ padding: '4px 8px', borderRadius: 999, background: it.typeBg, color: '#000000', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{it.type}</span>}
            </div>
            <span style={{ fontSize: 20, fontWeight: 500, color: '#FFFFFF' }}>{it.title}</span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: th.muted }}>{it.note}</span>
          </div>
        ))}
      </div>
      {!!pg.href && (
        <a href={pg.href} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 20px', borderRadius: 999, background: pg.accent, color: '#000000', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>{pg.linkLabel} ↗</a>
      )}
      {!!pg.legend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12, color: th.muted }}>
          {LEGEND.map((l) => (
            <span key={l.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: l.color }}></span>{l.label}</span>
          ))}
        </div>
      )}
    </section>
  );
}
