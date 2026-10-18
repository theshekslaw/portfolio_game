import type { MouseEvent } from 'react';
import type { NowPlaying } from './MusicPlayer';
import type { Theme } from '@/lib/types';

interface Props {
  th: Theme;
  menuOpen: boolean;
  onOpen: (e: MouseEvent<HTMLElement>) => void;
  crumb: string;
  sfx: boolean;
  music: boolean;
  nowPlaying: NowPlaying | null;
  onSfx: (e: MouseEvent<HTMLElement>) => void;
  onMusic: (e: MouseEvent<HTMLElement>) => void;
}

const SPEAKER = 'M4 9v6h4l5 4V5L8 9H4z';
const WAVES = 'M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12';
const NOTE = 'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';

export default function Header({ th, menuOpen, onOpen, crumb, sfx, music, nowPlaying, onSfx, onMusic }: Props) {
  const toggle = (on: boolean) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 14px', border: th.tabBorder, borderRadius: th.tabRadius, background: on ? th.tabOnBg : th.tabBg, color: on ? th.tabOnInk : th.tabInk, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const });
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

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <span aria-live="polite" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: th.muted, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{crumb}</span>
        {music && nowPlaying && (
          <a aria-live="polite" href={nowPlaying.href} target="_blank" rel="noopener noreferrer" title={`${nowPlaying.text} · ${nowPlaying.license} · source`} style={{ display: 'inline-flex', flexDirection: 'column', maxWidth: 240, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', color: th.muted, textDecoration: 'none', lineHeight: 1.3 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>♪ {nowPlaying.text}</span>
            <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>{nowPlaying.license} · Jamendo ↗</span>
          </a>
        )}
        <button aria-pressed={music} aria-label="Music" onClick={onMusic} style={toggle(music)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={NOTE} />{!music && <path d="M3 3l18 18" />}</svg>
          Music
        </button>
        <button aria-pressed={sfx} aria-label="Sound effects" onClick={onSfx} style={toggle(sfx)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={SPEAKER} fill="currentColor" />{sfx ? <path d={WAVES} /> : <path d="M17 9l5 6M22 9l-5 6" />}</svg>
          SFX
        </button>
      </div>
    </header>
  );
}
