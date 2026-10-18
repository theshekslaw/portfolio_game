import type { MouseEvent } from 'react';
import type { Theme } from '@/lib/types';

type Click = (e: MouseEvent<HTMLElement>) => void;

export interface RingCat { key: string; label: string; on: boolean; x: string; y: string; pick: Click }
export interface RingSub { label: string; bg: string; ink: string; x: string; y: string; go: Click }

interface Props {
  th: Theme;
  ringCats: RingCat[];
  ringSubs: RingSub[];
  onBackdrop: Click;
  onClose: Click;
  onHome: Click;
}

// Radial menu: inner ring (4 categories at r=31%), outer ring (sub-items at r=47%), centre disc = Home.
export default function Cassette({ th, ringCats, ringSubs, onBackdrop, onClose, onHome }: Props) {
  return (
    <div role="dialog" aria-modal="true" aria-label="Navigation cassette" onClick={onBackdrop} style={{ position: 'fixed', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
      <button aria-label="Close menu" onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 48, height: 48, borderRadius: 999, border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.5)', color: '#FFFFFF', fontSize: 22, lineHeight: 1 }}>×</button>
      <div className="cas" style={{ position: 'relative', width: 'min(680px, 94vw)', aspectRatio: '1 / 1' }}>
        <svg className="reel" viewBox="0 0 100 100" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: th.ringColor }}>
          <circle cx="50" cy="50" r="48.5" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 2.2"></circle>
          <circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 3"></circle>
          <circle cx="50" cy="50" r="12" fill="rgba(0,0,0,0.6)" stroke="currentColor" strokeWidth="0.6"></circle>
          <path d="M50 39 L51.5 48 L50 50 L48.5 48 Z M61 50 L52 51.5 L50 50 L52 48.5 Z M50 61 L48.5 52 L50 50 L51.5 52 Z M39 50 L48 48.5 L50 50 L48 51.5 Z" fill="currentColor"></path>
        </svg>
        <button aria-label="Go to home" onClick={onHome} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '22%', aspectRatio: '1 / 1', borderRadius: 999, border: `2px solid ${th.ringColor}`, background: 'rgba(0,0,0,0.7)', color: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: th.display, fontSize: 'clamp(16px, 2.2vw, 26px)', letterSpacing: '0.02em', cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10v9.5h13V10"></path></svg>
          SHEK
        </button>
        {ringCats.map((rc) => (
          <button key={rc.key} className="pop" aria-pressed={rc.on ? 'true' : 'false'} onClick={rc.pick} style={{ position: 'absolute', left: rc.x, top: rc.y, transform: 'translate(-50%, -50%)', minWidth: 124, minHeight: 48, padding: '0 18px', borderRadius: 999, border: rc.on ? '2px solid #FFFFFF' : '2px solid rgba(255,255,255,0.5)', background: rc.on ? '#FFFFFF' : 'rgba(0,0,0,0.6)', color: rc.on ? '#000000' : '#FFFFFF', fontFamily: th.body, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{rc.label}</button>
        ))}
        {ringSubs.map((rs) => (
          <button key={rs.label} className="pop2" onClick={rs.go} style={{ position: 'absolute', left: rs.x, top: rs.y, transform: 'translate(-50%, -50%)', minWidth: 112, minHeight: 44, padding: '0 14px', borderRadius: 999, border: `1px solid ${th.ringColor}`, background: rs.bg, color: rs.ink, fontFamily: th.body, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>{rs.label}</button>
        ))}
      </div>
    </div>
  );
}
