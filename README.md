# Shek — Power Modes portfolio

Next.js 15 (App Router, TypeScript, no Tailwind) build of the "Anime Power Modes" design.
The original design handoff lives in `docs/handoff/` (`HANDOFF.md`, `Modes.dc.html`, `scenes.js`, …).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Where things live

| Path | What |
|---|---|
| `data/tokens.json` | All content and themes: `professions` (home/software/ml/cloud/llmops), `pages` (fitness/hobbies/social), `catalog` (cassette menu). Edit copy here. |
| `lib/sceneEngine.js` | Canvas renderer. Every `draw*` / `make*` method is copied verbatim from `docs/handoff/scenes.js`; only the React plumbing around it is new. |
| `components/Portfolio.tsx` | Owns state (`mode`, `page`, `menu`, `cat`, `god`), the 4 s god-mode timer and cassette geometry. |
| `components/SceneCanvas.tsx` | Mounts the engine, syncs state into it, handles `prefers-reduced-motion`. |
| `components/{Header,Cassette,Hero,ContentPage,HomeCards}.tsx` | Markup translated 1:1 from `Modes.dc.html`. |
| `app/layout.tsx` | Google Fonts `<link>` (not `next/font`, which would rename the families the canvas uses). |
