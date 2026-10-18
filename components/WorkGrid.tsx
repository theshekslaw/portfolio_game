import type { Theme, WorkItem } from '@/lib/types';

// "Selected work" cards on a profession view, skinned with the theme's card tokens (panel, border, radius, cardTag…).
export default function WorkGrid({ th, work }: { th: Theme; work: WorkItem[] }) {
  return (
    <section aria-label="Selected work" className="rise3" style={{ flex: '1 1 100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: th.muted }}>Selected work</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {work.map((w, i) => {
          const external = /^https?:\/\//.test(w.href);
          const Card = external ? 'a' : 'div';
          return (
            <Card key={w.title} {...(external ? { href: w.href, target: '_blank', rel: 'noopener noreferrer' } : {})} style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 180, padding: 20, boxSizing: 'border-box', textDecoration: 'none', background: th.panel, border: th.border, borderRadius: th.radius, boxShadow: th.shadow, color: th.cardInk }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: th.cardMuted }}>{th.cardTag} {String(i + 1).padStart(2, '0')} · {w.tag}</span>
                {external && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"></path></svg>}
              </div>
              <span style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.15 }}>{w.title}</span>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: th.cardMuted }}>{w.note}</span>
              <span style={{ marginTop: 'auto', fontSize: 12, color: th.cardMuted }}>{w.meta}</span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
