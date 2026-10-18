# Shek Portfolio — handoff for Next.js

This bundle is the complete design source for the "Anime Power Modes" portfolio. Give the whole folder to Claude Code with the prompt at the bottom.

## Files

| File | What it is | How to use it |
|---|---|---|
| `Modes.dc.html` | The single source of truth: markup, inline styles, and the full animation engine (canvas). | Read it end to end. Markup → React components; `<script type="text/x-dc">` → hooks + a canvas renderer. |
| `scenes.js` | The component class extracted from `Modes.dc.html` (identical code, easier to read). | Port `themes()`, `pages()`, `catalog()` as data; port every `draw*` method verbatim into a canvas renderer. |
| `tokens.json` | The same `themes`, `pages`, `catalog` data as JSON (functions stripped). | Drop into `/data` as-is. |
| `global.css` | The global CSS (keyframes, focus rings, cassette pop animations). | Paste into `app/globals.css`. |
| `fonts.txt` | The exact Google Fonts URL with every family used. | Load via `next/font/google` or a `<link>` in the root layout. |
| `PageML.dc.html` | An earlier full-scroll page for the ML form (hero, work cards, about, skills gauges, timeline, contact). | Optional reference for a long-scroll version of each profession page. |

## What is "design-tool syntax" vs real code

The `.dc.html` format is 95% standard HTML/CSS/JS. Only these pieces are templating and must be translated:

| In the file | Meaning | Next.js equivalent |
|---|---|---|
| `<x-dc> … </x-dc>` | Root wrapper | Remove; the content is the page. |
| `<helmet><style>…</style><link …></helmet>` | Global CSS + fonts | `globals.css` + root layout. |
| `{{th.bg}}`, `{{pg.title}}`, `{{w.href}}` | Template holes (dotted lookups into `renderVals()`) | JSX expressions `{theme.bg}`. |
| `<sc-for list="{{items}}" as="x">…</sc-for>` | Loop | `items.map(x => …)`. |
| `<sc-if value="{{cond}}">…</sc-if>` | Conditional | `{cond && (…)}`. |
| `onClick="{{fn}}"`, `onMouseMove`, `ref="{{setCanvas}}"` | React-style handlers/refs | Same names in JSX. |
| `hint-placeholder-*` attributes | Preview hints | Delete. |
| `class Component extends DCLogic { state, setState, renderVals(), componentDidMount/Update/WillUnmount }` | React class semantics | A `'use client'` component with `useState`/`useEffect`/`useRef`; `renderVals()` becomes the body of the render. |
| `data-props='…'` | Design-time tweak controls | Ignore (or expose `startMode` as a prop). |

Everything inside the `draw*` methods (`drawTandava`, `drawPirate`, `drawVortex`, `drawSun`, `drawEmber`, `drawPageFx`, `makeGrunge`, `makeDistress`, `makePalette`, `layer`) is plain Canvas 2D and should be copied **verbatim** into a `SceneCanvas` client component. Do not re-interpret the visuals; they are the spec.

## App structure (suggested)

```
app/
  layout.tsx            fonts + globals.css
  page.tsx              <Portfolio />
components/
  Portfolio.tsx         'use client' — owns state: mode, page, menu, cat, god
  SceneCanvas.tsx       'use client' — <canvas> + requestAnimationFrame; holds every draw* method
  Header.tsx            SHEK button (opens cassette) + status line
  Cassette.tsx          radial menu: inner ring (4 categories), outer ring (sub-items), centre SHEK/home button
  Hero.tsx              title / sub / chips, themed by `theme`
  WorkGrid.tsx          "Work in this form" link cards (profession views)
  ContentPage.tsx       Fitness / Hobbies / Social page: glass panel, "Currently" card, item cards, legend, follow link
  HomeCards.tsx         "Four sides of me" category cards
data/
  tokens.json           themes (professions), pages, catalog
```

## Behaviour that must be preserved

1. **One layout, many skins.** The markup never changes between forms; only `theme` values (colors, fonts, borders, radii, shadows) and the canvas scene do. Theme keys: `home`, `software` (Straw Hat), `ml` (Arcane Vortex), `cloud` (Solar Seal), `llmops` (Ember Protocol).
2. **Cassette navigation.** `SHEK` in the header opens a full-screen dialog (blur backdrop). Inner ring = Professional, Fitness, Hobbies, Social at N/E/S/W (radius 31%). Picking one fans the outer ring (radius 47%) around that angle. Professional items set `mode`; others set `page`. Centre disc = Home. `Esc`, `×`, or backdrop click closes. Positions are computed with `50 + cos(a)*r %` — see `ringCats`/`ringSubs` in `renderVals()`.
3. **Transformation timing.** Every view enters calm, then **4 s later** `god = true` and stays until you leave (`armGod()`). Each scene reads `god` and intensifies.
4. **Mode-switch wipe.** On mode change, a diagonal band in the new theme's `wipe` colour sweeps across (0.7 s) with a white flash at the start — see the `wipeStart` block in `frame()`.
5. **Click interactions.** Home: click = strike (shockwave ring + screen shake). Software: click = hat bounce + "ドン!" pop. (`_tap`.)
6. **Pages.** Fitness/Hobbies/Social render `ContentPage` on a frosted-glass panel (`rgba(8,8,10,0.72)`, blur 10px) so text is always legible over the pattern scenes. The page's `theme.fx` selects the canvas scene: `halftone`, `ukiyo`, `iron`, `cwaves`, `mosaic`, `network`, `heatmap`, `play`, `doodle`, `halftoneMono`.
7. **Reduced motion.** Respect `prefers-reduced-motion`: freeze canvases to a still frame and disable CSS animations.
8. **Accessibility.** Real `<button>`/`<a>`, `aria-pressed` on toggles, `role="dialog" aria-modal` on the cassette, focus-visible rings, ≥44px targets.

## Content model

All copy in `[BRACKETS]` is placeholder. The frequently-changing content (current book, current game, weekly km, latest posts, work cards) lives in `tokens.json → pages[*].now / items` and `professions[*].work`. Keep it in JSON (or a tiny CMS) so it can be edited without touching components.

## Prompt for Claude Code

> Build this portfolio in Next.js 15 (App Router, TypeScript, no Tailwind — use CSS modules or inline styles to match the source exactly). Read `HANDOFF.md` first, then `Modes.dc.html` and `scenes.js`. Replicate the markup, inline styles and copy 1:1 from `Modes.dc.html`, translating only the templating listed in the handoff table. Port every `draw*` method from `scenes.js` verbatim into a client-side `SceneCanvas` component driven by `requestAnimationFrame`, with devicePixelRatio handling as in `frame()`. Load the fonts from `fonts.txt`. Use `tokens.json` as the data layer. Preserve all behaviour in the "Behaviour that must be preserved" section, including the 4-second god-mode timer, the cassette geometry, the mode-switch wipe, and the glass panel on content pages. Do not redesign anything; where the source is ambiguous, prefer matching the source over improving it.
