import type { MouseEvent } from 'react';
import type { Theme } from '@/lib/types';

export interface HomeCat {
  key: string;
  label: string;
  kind: string;
  num: string;
  summary: string;
  open: (e: MouseEvent<HTMLElement>) => void;
}

export default function HomeCards({ th, cats }: { th: Theme; cats: HomeCat[] }) {
  // Home stays light: four compact doors into the rest of the site, no descriptions.
  return (
    <section aria-label="Four sides of me" style={{ flex: '1 1 380px', minWidth: 0, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontFamily: th.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: th.muted }}>Four sides of me</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        {cats.map((d) => (
          <button key={d.key} onClick={d.open} title={d.summary} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 88, padding: '14px 16px', textAlign: 'left', border: '1px solid rgba(139,69,240,0.6)', borderRadius: 4, background: 'rgba(0,0,0,0.6)', color: '#EDE6FF', fontFamily: "'Geist Mono', monospace" }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#B9A3E8' }}>{d.num} · {d.kind}</span>
              <span style={{ fontSize: 19, fontWeight: 500, color: '#FFFFFF' }}>{d.label}</span>
            </span>
            <span aria-hidden="true" style={{ fontSize: 20, color: '#B98CFF' }}>→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
