'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import SceneEngine from '@/lib/sceneEngine';

interface Props {
  engineRef: MutableRefObject<SceneEngine | null>;
  startMode: string;
  mode: string | null;
  page: string | null;
  god: boolean;
  menu: string | null;
}

export default function SceneCanvas({ engineRef, startMode, mode, page, god, menu }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef({ mode, page, god, menu });
  latest.current = { mode, page, god, menu };

  // The engine touches `document`, so it is only ever built on the client, inside an effect.
  useEffect(() => {
    const engine = new SceneEngine(startMode);
    engine.state = { ...latest.current };
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    engine.reduced = mq.matches;
    engine.attach(canvasRef.current);
    engineRef.current = engine;

    const onMotion = () => engine.setReduced(mq.matches);
    mq.addEventListener('change', onMotion);
    // A still canvas needs repainting when it is resized; the animated loop handles that every frame.
    const ro = new ResizeObserver(() => { if (engine.reduced) engine.renderStill(); });
    if (canvasRef.current) ro.observe(canvasRef.current);

    return () => {
      mq.removeEventListener('change', onMotion);
      ro.disconnect();
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [engineRef, startMode]);

  useEffect(() => {
    engineRef.current?.sync({ mode, page, god, menu });
  }, [engineRef, mode, page, god, menu]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
    />
  );
}
