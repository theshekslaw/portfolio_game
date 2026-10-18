'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import type SceneEngine from '@/lib/sceneEngine';
import { catalog, pages, professions } from '@/lib/data';
import type { Category, CatalogItem, ModeKey, Theme } from '@/lib/types';
import SceneCanvas from './SceneCanvas';
import Header from './Header';
import Cassette, { type RingCat, type RingSub } from './Cassette';
import Hero from './Hero';
import ContentPage from './ContentPage';
import HomeCards from './HomeCards';

type Click = MouseEvent<HTMLElement>;

const pos = (ang: number, r: number) => ({
  x: (50 + Math.cos(ang) * r).toFixed(2) + '%',
  y: (50 + Math.sin(ang) * r).toFixed(2) + '%',
});

export default function Portfolio({ startMode = 'home' }: { startMode?: ModeKey }) {
  const [mode, setMode] = useState<ModeKey | null>(null);
  const [page, setPage] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const [god, setGod] = useState(false);
  const [toast] = useState('');
  const engineRef = useRef<SceneEngine | null>(null);
  const godTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Every view starts calm; 4 s later it shifts into god mode and stays there until you leave.
  const armGod = useCallback(() => {
    clearTimeout(godTimer.current);
    godTimer.current = setTimeout(() => setGod(true), 4000);
  }, []);

  useEffect(() => {
    armGod();
    return () => clearTimeout(godTimer.current);
  }, [armGod]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menu) { setMenu(null); setCat(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);

  const go = (next: { mode: ModeKey; page: string | null }) => {
    setMode(next.mode); setPage(next.page); setMenu(null); setCat(null); setGod(false);
    armGod();
  };
  const enterMode = (m: ModeKey) => go({ mode: m, page: null });

  const k: ModeKey = mode || startMode;
  const pageKey = page;
  const isPage = !!pageKey && k === 'home';
  const pgRaw = isPage ? pages[pageKey] : null;
  const pageTheme = k === 'home' && pageKey && pages[pageKey] ? pages[pageKey].theme : null;
  const th: Theme = pageTheme
    ? { ...professions.home, ...pageTheme, head: '#FFFFFF', tabBg: 'rgba(0,0,0,0.5)', border2: 'rgba(255,255,255,0.3)' }
    : professions[k];
  const menuOpen = !!menu;

  const openMenu = (e: Click) => { e.stopPropagation(); setMenu('root'); setCat(null); };
  const goHome = (e: Click) => { e.stopPropagation(); go({ mode: 'home', page: null }); };
  const closeMenu = (e: Click) => { e.stopPropagation(); setMenu(null); setCat(null); };
  const stopTap = (e: Click) => { e.stopPropagation(); if (e.target === e.currentTarget) { setMenu(null); setCat(null); } };

  const mkItem = (it: CatalogItem, c: Category) => {
    const pk = c.key + ':' + it.label;
    const on = it.mode ? it.mode === k && !isPage : pageKey === pk;
    return {
      label: it.label,
      bg: on ? '#FFFFFF' : 'rgba(0,0,0,0.75)',
      ink: on ? '#000000' : '#FFFFFF',
      go: (e: Click) => {
        e.stopPropagation();
        if (it.mode) enterMode(it.mode);
        else go({ mode: 'home', page: pk });
      },
    };
  };

  const ringCats: RingCat[] = catalog.map((c, i) => {
    const ang = -Math.PI / 2 + i * (Math.PI / 2);
    const p = pos(ang, 31);
    return {
      key: c.key, label: c.label, on: cat === c.key, x: p.x, y: p.y,
      pick: (e: Click) => { e.stopPropagation(); setCat(cat === c.key ? null : c.key); },
    };
  });

  let ringSubs: RingSub[] = [];
  const active = catalog.find((c) => c.key === cat);
  if (active) {
    const i = catalog.indexOf(active), base = -Math.PI / 2 + i * (Math.PI / 2), n = active.items.length;
    const spread = Math.min(Math.PI * 0.95, 0.42 * (n - 1) + 0.3);
    ringSubs = active.items.map((it, j) => {
      const ang = base + (n === 1 ? 0 : -spread / 2 + j * (spread / (n - 1)));
      const p = pos(ang, 47);
      return { ...mkItem(it, active), x: p.x, y: p.y };
    });
  }

  const cats = catalog.map((c) => ({
    key: c.key, label: c.label, kind: c.kind, num: c.num, summary: c.summary,
    open: (e: Click) => { e.stopPropagation(); setMenu('root'); setCat(c.key); },
  }));

  return (
    <div
      onMouseMove={(e) => engineRef.current?.onMove(e)}
      onMouseLeave={() => engineRef.current?.leave()}
      onClick={(e) => engineRef.current?.tap(e)}
      style={{ position: 'relative', width: '100%', minHeight: '100vh', background: th.bg, color: th.ink, fontFamily: th.body, overflow: 'hidden', boxSizing: 'border-box', transition: 'background-color .5s, color .5s' }}
    >
      <SceneCanvas engineRef={engineRef} startMode={startMode} mode={mode} page={page} god={god} menu={menu} />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', boxSizing: 'border-box', padding: '28px clamp(20px, 4vw, 56px)', display: 'flex', flexDirection: 'column', gap: 40 }}>
        <Header th={th} menuOpen={menuOpen} onOpen={openMenu} crumb={toast} />

        {menuOpen && (
          <Cassette th={th} ringCats={ringCats} ringSubs={ringSubs} onBackdrop={stopTap} onClose={closeMenu} onHome={goHome} />
        )}

        <main style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 48 }}>
          {isPage && pgRaw ? (
            <ContentPage th={th} pg={pgRaw} />
          ) : (
            <>
              <Hero modeKey={k} th={th} headShadow={god ? th.godShadow : th.headShadow} />
              {k === 'home' && <HomeCards th={th} cats={cats} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
