'use client';

import { useEffect, useRef } from 'react';
import playlists from '@/data/playlists.json';
import { sound } from '@/lib/sound';

// Local music: free Creative Commons tracks served from public/music (see data/playlists.json); the credit
// (title, artist, licence, source) is shown in the header while each one plays. Each view has its own
// playlist; switching view starts that view's next track immediately, and a track that ends hands over to the
// next one. All tracks are probed once (HEAD) so missing files are skipped, and the first track of every view
// is preloaded so playback starts instantly.

interface Track { file: string; title: string; artist: string; license: string; source: string }
export interface NowPlaying { text: string; license: string; href: string }
const PLAYLISTS = Object.fromEntries(Object.entries(playlists).filter(([k]) => !k.startsWith('_'))) as Record<string, Track[]>;

export default function MusicPlayer({ on, view, onTitle }: { on: boolean; view: string; onTitle: (t: NowPlaying | null) => void }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const available = useRef<Record<string, Track[]> | null>(null);
  const turn = useRef<Record<string, number>>({});
  const current = useRef<{ view: string; i: number } | null>(null);
  const latest = useRef({ on, view, onTitle });
  latest.current = { on, view, onTitle };

  const label = (t: Track): NowPlaying => ({ text: `${t.title} — ${t.artist}`, license: t.license, href: t.source });

  const play = (v: string, i?: number) => {
    const list = available.current?.[v] ?? available.current?.home ?? [];
    const a = audio.current;
    if (!a || !list.length) return latest.current.onTitle(null);
    const idx = i ?? (turn.current[v] ?? 0) % list.length;
    turn.current[v] = idx + 1;
    current.current = { view: v, i: idx };
    a.src = list[idx].file;
    a.currentTime = 0;
    a.play().then(() => latest.current.onTitle(label(list[idx]))).catch(() => latest.current.onTitle(null));
  };

  // One shared <audio>; find which files exist and warm up each view's first track.
  useEffect(() => {
    const a = new Audio();
    a.preload = 'auto';
    a.onended = () => {
      const c = current.current;
      if (c && latest.current.on) play(c.view, c.i + 1 >= (available.current?.[c.view]?.length ?? 1) ? 0 : c.i + 1);
    };
    audio.current = a;
    let cancelled = false;
    Promise.all(
      Object.entries(PLAYLISTS).map(async ([v, list]) => {
        const ok = await Promise.all(list.map((t) => fetch(t.file, { method: 'HEAD' }).then((r) => r.ok && (r.headers.get('content-type') ?? '').startsWith('audio')).catch(() => false)));
        return [v, list.filter((_, i) => ok[i])] as const;
      }),
    ).then((entries) => {
      if (cancelled) return;
      available.current = Object.fromEntries(entries);
      for (const list of Object.values(available.current)) if (list[0]) { const p = new Audio(); p.preload = 'auto'; p.src = list[0].file; }
      if (latest.current.on) play(latest.current.view);
    });
    return () => {
      cancelled = true;
      a.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Music on/off and view changes.
  useEffect(() => {
    const a = audio.current;
    if (!on) {
      a?.pause();
      onTitle(null);
      return;
    }
    if (!available.current) return; // starts once the file check finishes
    if (current.current?.view !== view || a?.paused) play(view);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, view]);

  // Duck under the god-mode boom.
  useEffect(() => {
    sound.onDuck = (seconds) => {
      const a = audio.current;
      if (!a || !on) return;
      a.volume = 0.3;
      setTimeout(() => { a.volume = 1; }, seconds * 1000);
    };
    return () => { sound.onDuck = null; };
  }, [on]);

  return null;
}
