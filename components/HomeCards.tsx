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
  return (
    <section aria-label="Four sides of me" style={{ flex: '1 1 420px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <span style={{ fontFamily: th.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: th.muted }}>Four sides of me</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
        {cats.map((d) => (
          <button key={d.key} onClick={d.open} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, minHeight: 150, padding: 18, textAlign: 'left', border: '1px solid rgba(139,69,240,0.6)', borderRadius: 4, background: 'rgba(0,0,0,0.55)', color: '#EDE6FF', fontFamily: "'Geist Mono', monospace" }}>
            <span style={{ fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B9A3E8' }}>{d.num} · {d.kind}</span>
            <span style={{ fontSize: 20, fontWeight: 500, color: '#FFFFFF' }}>{d.label} →</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: '#B9A3E8' }}>{d.summary}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
