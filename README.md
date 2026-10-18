# Shek — Power Modes portfolio

Next.js 15 (App Router, TypeScript, no Tailwind) build of the "Anime Power Modes" design.
The original design handoff lives in `docs/handoff/` (`HANDOFF.md`, `Modes.dc.html`, `scenes.js`, …).

```bash
cp .env.example .env.local   # then fill in the values (Neon: `neon env pull`)
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
| `components/MusicPlayer.tsx`, `data/playlists.json` | Background music: two free Creative Commons tracks per view, stored in `public/music/` (64 kbps). The header shows each track's required credit while it plays. |
| `lib/sound.ts` | God-mode sound effects (synthesised with Web Audio, no files). |
| `db/schema.ts`, `db/migrations/`, `lib/db.ts` | Neon Postgres via Drizzle: `reading_items` (Reading page) and `oauth_tokens` (Strava). `npm run db:generate` / `npm run db:migrate`; seed books + papers with `npm run db:seed:reading`. |
| `lib/social.ts`, `lib/strava.ts` | Live GitHub / YouTube content and Strava runs (cached for an hour, fall back to `tokens.json`). |
| `data/quotes.json`, `lib/quotes.ts` | Daily quote per view. |

## Environment

See `.env.example`. Secrets (`DATABASE_URL*`, `STRAVA_*`, `GITHUB_TOKEN`) are server-only; `NEXT_PUBLIC_*` values are public profile links. Set the same variables in Vercel.
