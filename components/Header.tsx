import type { MouseEvent } from 'react';
import type { Theme } from '@/lib/types';

interface Props {
  th: Theme;
  menuOpen: boolean;
  onOpen: (e: MouseEvent<HTMLElement>) => void;
  crumb: string;
}

export default function Header({ th, menuOpen, onOpen, crumb }: Props) {
  return (
    <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button aria-haspopup="dialog" aria-expanded={menuOpen ? 'true' : 'false'} onClick={onOpen} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 44, padding: '0 6px', border: 0, background: 'transparent', fontFamily: th.display, fontSize: 28, letterSpacing: '0.02em', color: th.head }}>
          <span className="spin" aria-hidden="true" style={{ display: 'inline-flex' }}>
            <svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="none" stroke="currentColor" strokeWidth="2"></circle><circle cx="15" cy="15" r="4" fill="currentColor"></circle><path d="M15 2 L17 9 L15 11 L13 9 Z M28 15 L21 17 L19 15 L21 13 Z M15 28 L13 21 L15 19 L17 21 Z M2 15 L9 13 L11 15 L9 17 Z" fill="currentColor"></path></svg>
          </span>
          SHEK
        </button>
        <span className="hint" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: th.muted }}>tap to open</span>
      </div>

      <span aria-live="polite" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: th.muted, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{crumb}</span>
    </header>
  );
}
