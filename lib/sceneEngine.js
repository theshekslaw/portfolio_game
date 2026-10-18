// Canvas scene engine, ported from docs/handoff/scenes.js.
// Everything from initBlob() down to drawEmber() is copied verbatim from the source; only the
// React plumbing around it (state, props, lifecycle, loop start/stop) is rewritten here.
import tokens from '../data/tokens.json';

export default class SceneEngine {
  constructor(startMode) {
    this.props = { startMode: startMode || 'home' };
    this.state = { mode: null, god: false, page: null, menu: null };
    this.reduced = false;
  }

  themes() { return tokens.professions; }
  pages() { return tokens.pages; }
  modeKey() { return (this.state && this.state.mode) || this.props.startMode || 'home'; }
  isGod() { return !!(this.state && this.state.god); }

  // Replaces setState + componentDidUpdate: React pushes its state in, transitions are detected here.
  sync(next) {
    const ps = this.state;
    this.state = { ...ps, ...next };
    this.componentDidUpdate(this.props, ps);
    if (this.reduced) this.renderStill();
  }
  componentDidUpdate(pp, ps) {
    const prev = (ps && ps.mode) || pp.startMode || 'home';
    if (prev !== this.modeKey()) { this.wipeStart = performance.now(); this.bolts = []; if (this.modeKey() === 'software') this.hat = null; }
    const pg = !!(ps && ps.god);
    if (pg !== this.isGod() && this.isGod()) { this.shakeStart = performance.now(); this.godAt = performance.now(); }
  }

  attach(el) {
    if (!el || this.cv === el) return;
    this.cv = el; this.ctx = el.getContext('2d');
    this.mx = this.my = -1e4; this.emx = this.emy = -1e4;
    this.layers = {}; this.bolts = []; this.lastBolt = 0; this.lines = []; this.lastLines = 0;
    this.initBlob(); this.initVortex(); this.initMotes(); this.fire = null;
    this.grunge = this.makeGrunge(); this.distress = this.makeDistress();
    this.palette = this.makePalette();
    this.last = performance.now();
    if (this.reduced) this.renderStill(); else this.start();
  }
  start() {
    if (this.raf || this.dead) return;
    const step = (now) => { if (this.dead) return; this.raf = requestAnimationFrame(step); this.frame(now); };
    this.raf = requestAnimationFrame(step);
  }
  stop() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; }
  destroy() { this.dead = true; this.stop(); }
  setReduced(reduced) {
    this.reduced = reduced;
    if (!this.cv) return;
    if (reduced) { this.stop(); this.renderStill(); } else { this.last = performance.now(); this.start(); }
  }
  // prefers-reduced-motion: simulate ~1.5 s off-screen (so the fire sim fills and the page entry flash
  // has faded), then leave the last frame on the canvas as a still. Wipes and shakes are skipped.
  renderStill() {
    if (!this.cv || this.dead) return;
    this.wipeStart = 0; this.shakeStart = 0;
    const base = performance.now(); this.last = base;
    for (let i = 0; i < 90; i++) this.frame(base + i * 16);
  }

  onMove(e) {
    const el = this.cv; if (!el) return;
    const r = el.getBoundingClientRect(), k = el.clientWidth / (r.width || 1);
    this.mx = (e.clientX - r.left) * k; this.my = (e.clientY - r.top) * k;
  }
  leave() { this.mx = this.my = -1e4; }
  // Click: strike on Home, hat bounce on Software (the source's _tap).
  tap(e) { if (!this.cv || this.state.menu) return; const m = this.modeKey(); const r = this.cv.getBoundingClientRect(); if (m === 'home') { (this.strikes = this.strikes || []).push({ x: e.clientX - r.left, y: e.clientY - r.top, born: performance.now() }); this.shakeStart = performance.now(); } else if (m === 'software' && this.hat) { this.hat.vy = -9; } }

  initBlob() {
    const n = 9000, a = new Float32Array(n * 3), tw = new Float32Array(n), ph = new Float32Array(n), PI = Math.PI, R = Math.random;
    for (let i = 0; i < n; i++) {
      const t = R(), u = R() * PI * 2;
      const r = (0.24 + 0.2 * Math.pow(Math.sin(t * PI), 0.7) + 0.26 * t) * (1 + 0.05 * Math.sin(u * 3 + t * 11)) * (0.94 + 0.06 * R());
      a[i * 3] = (t - 0.5) * 2.8; a[i * 3 + 1] = 0.55 * t - 0.5 * Math.sin(t * PI * 1.1) - 0.05 + r * Math.cos(u); a[i * 3 + 2] = r * Math.sin(u) * 1.15;
      tw[i] = 0.2 + 0.8 * Math.pow(R(), 2.5); ph[i] = R() * 6.283;
    }
    this.blob = { a, tw, ph, n };
  }
  initVortex() {
    const n = 2800; this.vx = { r: new Float32Array(n), a: new Float32Array(n), n };
    for (let i = 0; i < n; i++) { this.vx.r[i] = 0.04 + Math.random(); this.vx.a[i] = Math.random() * 6.283; }
  }
  initMotes() {
    const n = 800; this.mo = { x: new Float32Array(n), y: new Float32Array(n), v: new Float32Array(n), s: new Float32Array(n), n };
    for (let i = 0; i < n; i++) { this.mo.x[i] = Math.random(); this.mo.y[i] = Math.random(); this.mo.v[i] = 0.02 + Math.random() * 0.06; this.mo.s[i] = 1 + Math.random() * 2.5; }
  }
  makeGrunge() {
    const c = document.createElement('canvas'); c.width = 600; c.height = 600; const g = c.getContext('2d');
    for (let i = 0; i < 420; i++) {
      g.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.035).toFixed(3) + ')';
      g.beginPath(); g.ellipse(Math.random() * 600, Math.random() * 600, 10 + Math.random() * 90, 4 + Math.random() * 30, Math.random() * 3.14, 0, 6.283); g.fill();
    }
    for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.08).toFixed(3) + ')'; g.fillRect(Math.random() * 600, Math.random() * 600, 1, 1); }
    g.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 40; i++) { g.beginPath(); const x = Math.random() * 600, y = Math.random() * 600; g.moveTo(x, y); g.lineTo(x + (Math.random() - 0.5) * 200, y + (Math.random() - 0.5) * 200); g.stroke(); }
    return c;
  }
  makeDistress() {
    const c = document.createElement('canvas'); c.width = 700; c.height = 700; const g = c.getContext('2d');
    g.fillStyle = '#000';
    for (let i = 0; i < 2600; i++) { const r = Math.random() < 0.85 ? 0.6 + Math.random() * 1.6 : 2 + Math.random() * 4; g.beginPath(); g.arc(Math.random() * 700, Math.random() * 700, r, 0, 6.283); g.fill(); }
    g.strokeStyle = '#000'; g.lineCap = 'round';
    for (let i = 0; i < 90; i++) { g.lineWidth = 0.6 + Math.random() * 1.8; g.beginPath(); const x = Math.random() * 700, y = Math.random() * 700, a = Math.random() * 6.283, l = 10 + Math.random() * 60; g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.4) * l * 0.5, y + Math.sin(a + 0.4) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(Math.random() * 700, Math.random() * 700, 8 + Math.random() * 26, 3 + Math.random() * 9, Math.random() * 3.14, 0, 6.283); g.fill(); }
    return c;
  }
  makePalette() {
    const stops = [[0, [0, 0, 0]], [0.12, [58, 7, 3]], [0.32, [150, 16, 12]], [0.52, [226, 64, 12]], [0.72, [245, 166, 35]], [0.88, [255, 215, 122]], [1, [255, 245, 214]]];
    const out = [];
    for (let i = 0; i <= 36; i++) {
      const p = i / 36; let k = 0; while (k < stops.length - 2 && p > stops[k + 1][0]) k++;
      const a = stops[k], b = stops[k + 1], f = (p - a[0]) / (b[0] - a[0]);
      out.push('rgb(' + [0, 1, 2].map((j) => Math.round(a[1][j] + (b[1][j] - a[1][j]) * f)).join(',') + ')');
    }
    return out;
  }
  layer(key, W, H, draw) {
    const id = key + W + 'x' + H; if (this.layers[key] && this.layers[key].id === id) return this.layers[key].c;
    const c = document.createElement('canvas'); c.width = W; c.height = H; draw(c.getContext('2d'), W, H);
    this.layers[key] = { id, c }; return c;
  }

  frame(now) {
    const el = this.cv, ctx = this.ctx; if (!el || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2), W = el.clientWidth, H = el.clientHeight;
    if (!W || !H) return;
    const bw = Math.round(W * dpr), bh = Math.round(H * dpr);
    if (el.width !== bw || el.height !== bh) { el.width = bw; el.height = bh; }
    const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
    if (this.mx < -1e3 || this.emx < -1e3) { this.emx = this.mx; this.emy = this.my; }
    else { this.emx += (this.mx - this.emx) * 0.1; this.emy += (this.my - this.emy) * 0.1; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (this.shakeStart && now - this.shakeStart < 500) {
      const k = 1 - (now - this.shakeStart) / 500; ctx.translate((Math.random() - 0.5) * 14 * k, (Math.random() - 0.5) * 14 * k);
    }
    const m = this.modeKey(), god = this.isGod(), t = now / 1000;
    const pageKey = this.state && this.state.page;
    if (m === 'home' && pageKey) this.drawPageFx(ctx, W, H, t, now, dt, pageKey, god);
    else if (m === 'software') this.drawPirate(ctx, W, H, t, now, god);
    else if (m === 'ml') this.drawVortex(ctx, W, H, t, now, dt, god);
    else if (m === 'cloud') this.drawSun(ctx, W, H, t, dt, god);
    else if (m === 'llmops') this.drawEmber(ctx, W, H, god);
    else this.drawTandava(ctx, W, H, t, now, god);
    if (this.wipeStart) {
      const p = (now - this.wipeStart) / 700;
      if (p >= 1) this.wipeStart = 0;
      else {
        const x0 = -W * 0.7 + p * W * 2.4, bw2 = W * 0.28;
        ctx.globalAlpha = 1; ctx.fillStyle = this.themes()[m].wipe;
        ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + bw2, 0); ctx.lineTo(x0 + bw2 - H * 0.55, H); ctx.lineTo(x0 - H * 0.55, H); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath(); ctx.moveTo(x0 + bw2, 0); ctx.lineTo(x0 + bw2 + 18, 0); ctx.lineTo(x0 + bw2 + 18 - H * 0.55, H); ctx.lineTo(x0 + bw2 - H * 0.55, H); ctx.closePath(); ctx.fill();
        if (p < 0.3) { ctx.globalAlpha = (0.3 - p) * 1.2; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.globalAlpha = 1; }
      }
    }
  }

  // Home: Shrine. A code-drawn silhouette of the ascetic with the trishul on a black / violet split, ash drifting.
  drawTandava(ctx, W, H, t, now, god) {
    if (!this.ash) { this.ash = []; for (let i = 0; i < 260; i++) this.ash.push({ x: Math.random(), y: Math.random(), s: 1 + Math.random() * 3, v: 0.02 + Math.random() * 0.05, w: Math.random() * 6.283 }); this.strikes = []; }
    const narrow = W < 760, fx = narrow ? W * 0.5 : W * 0.7, fh = Math.min(H * 0.92, W * 0.7), base = H * 0.98, u = fh / 100;
    const breathe = 1 + 0.012 * Math.sin(t * 1.1);
    // background: split light panel and dark side, like a doorway of light
    // hard split: black on the left, violet on the right; the figure stands on the seam
    const lx = fx - u * 2, lw = W;
    ctx.globalAlpha = 1; ctx.fillStyle = '#000000'; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.fillStyle = '#8B45F0'; ctx.fillRect(lx, -20, W, H + 40);
    // seal ring behind the figure: jagged cracks, slow turn
    ctx.save(); ctx.translate(fx, base - 60 * u); ctx.rotate(t * (god ? 0.5 : 0.12));
    const sr = u * (god ? 46 : 40) * (1 + 0.02 * Math.sin(t * 2));
    ctx.lineWidth = 3 * u; ctx.strokeStyle = '#000000'; ctx.beginPath(); ctx.arc(0, 0, sr, 0, 6.283); ctx.stroke();
    ctx.lineWidth = 1.4 * u; ctx.strokeStyle = '#8B45F0'; ctx.beginPath(); ctx.arc(0, 0, sr + 2.4 * u, 0, 6.283); ctx.stroke();
    ctx.fillStyle = '#000000'; ctx.beginPath();
    for (let k = 0; k <= 96; k++) { const a = k / 96 * 6.283, jag = Math.sin(a * 13 + Math.sin(a * 5) * 3) * 2.2 + Math.sin(a * 29) * 1.1, r = sr * 0.8 + jag * u * (god ? 1.5 : 1); if (k) ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.lineWidth = 1.2 * u; ctx.strokeStyle = '#000000'; ctx.stroke();
    ctx.restore();
    // strikes: shockwave + flash
    this.strikes = this.strikes.filter((k) => now - k.born < 900);
    for (const k of this.strikes) { const l = (now - k.born) / 900, r = u * 10 + l * Math.min(W, H) * 0.9; ctx.globalAlpha = (1 - l) * 0.8; ctx.strokeStyle = '#EDE6FF'; ctx.lineWidth = 3 * (1 - l) + 1; ctx.beginPath(); ctx.arc(k.x, k.y, r, 0, 6.283); ctx.stroke(); ctx.lineWidth = 1; ctx.globalAlpha = (1 - l) * 0.35; ctx.beginPath(); ctx.arc(k.x, k.y, r * 0.7, 0, 6.283); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // ash drifting up and to the right
    const sp = god ? 2.2 : 1;
    for (const a of this.ash) {
      a.y -= a.v * sp / 60; a.x += (0.012 + 0.01 * Math.sin(t + a.w)) * sp / 60; if (a.y < -0.02 || a.x > 1.02) { a.y = 1.02; a.x = Math.random() * 0.9; }
      const px = a.x * W, py = a.y * H; const inBeam = px > lx && px < lx + lw;
      ctx.fillStyle = inBeam ? '#000000' : '#8B45F0'; ctx.globalAlpha = (0.25 + 0.5 * Math.sin(t * 2 + a.w) ** 2) * (god ? 1 : 0.8);
      ctx.save(); ctx.translate(px, py); ctx.rotate(t * 0.8 + a.w); ctx.fillRect(-a.s / 2, -a.s * 0.3, a.s, a.s * 0.6); ctx.restore();
    }
    ctx.globalAlpha = 1;
    // the figure
    ctx.save(); ctx.translate(fx, base); ctx.scale(breathe, breathe);
    const P = (pts) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0] * u, -p[1] * u) : ctx.moveTo(p[0] * u, -p[1] * u))); ctx.closePath(); };
    const drawBody = (fill) => {
      ctx.fillStyle = fill;
      // lower cloth, torn hem
      P([[-30, 0], [-26, 14], [-24, 30], [-20, 42], [-14, 48], [14, 48], [20, 40], [24, 28], [28, 12], [26, 0], [20, 2], [12, -1], [4, 3], [-4, -1], [-12, 3], [-20, -1]]); ctx.fill();
      // torso
      P([[-22, 46], [-24, 56], [-26, 66], [-22, 72], [-12, 76], [0, 77], [12, 76], [22, 72], [25, 64], [22, 54], [18, 46]]); ctx.fill();
      // neck + head
      ctx.beginPath(); ctx.ellipse(1 * u, -82 * u, 6.2 * u, 7.4 * u, -0.1, 0, 6.283); ctx.fill();
      P([[-4, 72], [4, 72], [5, 77], [-5, 77]]); ctx.fill();
      // jata (hair crown)
      P([[-5, 88], [-3, 96], [1, 103], [4, 97], [7, 90], [6, 86], [-4, 86]]); ctx.fill();
      // left arm raised, gripping the staff
      P([[-22, 70], [-30, 64], [-36, 58], [-40, 60], [-37, 68], [-32, 73], [-26, 74]]); ctx.fill();
      P([[-40, 60], [-44, 66], [-45, 74], [-41, 76], [-38, 70], [-36, 62]]); ctx.fill();
      // right arm, bent, hand closed on the bow grip
      P([[22, 70], [32, 64], [40, 56], [45, 49], [42, 45], [36, 52], [27, 60], [18, 64]]); ctx.fill();
      ctx.beginPath(); ctx.arc(46 * u, -47 * u, 3.6 * u, 0, 6.283); ctx.fill();
      // flowing hair strands (animated)
      for (let i = 0; i < 7; i++) {
        const ph = t * 1.4 + i * 0.9, sway = Math.sin(ph) * 2.5, len = 22 + i * 3;
        ctx.beginPath(); ctx.moveTo(4 * u, -(88 - i * 2) * u);
        ctx.bezierCurveTo((10 + sway) * u, -(90 - i * 3) * u, (14 + len * 0.5 + sway) * u, -(86 - i * 4 + Math.sin(ph * 0.7) * 2) * u, (6 + len) * u, -(76 - i * 4 + Math.sin(ph) * 3) * u);
        ctx.bezierCurveTo((14 + len * 0.5) * u, -(84 - i * 4) * u, (10 - sway) * u, -(86 - i * 3) * u, 4 * u, -(84 - i * 2) * u); ctx.closePath(); ctx.fill();
      }

    };
    // rim light: lighter copy offset to the left, then the dark body over it
    ctx.save(); ctx.shadowColor = 'rgba(185,140,255,0.95)'; ctx.shadowBlur = 22 * (god ? 1.6 : 1); drawBody('#B98CFF'); ctx.restore();
    ctx.save(); ctx.translate(-1.6 * u, 0); drawBody('#B98CFF'); ctx.restore();
    ctx.save(); ctx.translate(1.2 * u, 0); drawBody('#6C3FC2'); ctx.restore();
    drawBody('#000000');
    // weapons on top, in pale metal so they read on both halves
    const weapon = (col, w) => {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // trishul staff
      ctx.lineWidth = 2.2 * u * w; ctx.beginPath(); ctx.moveTo(-41.7 * u, -6 * u); ctx.lineTo(-41.7 * u, -118 * u); ctx.stroke();
      // centre prong + side prongs
      ctx.lineWidth = 2.4 * u * w; ctx.beginPath(); ctx.moveTo(-41.7 * u, -118 * u); ctx.lineTo(-41.7 * u, -142 * u); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-41.7 * u, -116 * u); ctx.bezierCurveTo(-54 * u, -118 * u, -56 * u, -132 * u, -50 * u, -140 * u); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-41.7 * u, -116 * u); ctx.bezierCurveTo(-29 * u, -118 * u, -27 * u, -132 * u, -33 * u, -140 * u); ctx.stroke();
      ctx.beginPath(); ctx.arc(-41.7 * u, -115 * u, 3 * u * w, 0, 6.283); ctx.fill();
      // damaru-style bands on the staff
      ctx.lineWidth = 3.4 * u * w; ctx.beginPath(); ctx.moveTo(-41.7 * u, -70 * u); ctx.lineTo(-41.7 * u, -64 * u); ctx.stroke();
      // dhanush: recurve bow, grip passing through the right hand
      ctx.lineWidth = 2.4 * u * w; ctx.beginPath(); ctx.moveTo(41 * u, -6 * u); ctx.bezierCurveTo(50 * u, -22 * u, 50 * u, -72 * u, 41 * u, -88 * u); ctx.stroke();
      ctx.lineWidth = 2 * u * w; ctx.beginPath(); ctx.moveTo(41 * u, -6 * u); ctx.lineTo(44 * u, -2 * u); ctx.moveTo(41 * u, -88 * u); ctx.lineTo(44 * u, -92 * u); ctx.stroke();
      ctx.lineWidth = 3.6 * u * w; ctx.beginPath(); ctx.moveTo(46.5 * u, -41 * u); ctx.lineTo(46.5 * u, -53 * u); ctx.stroke();
    };
    weapon('#000000', 1.9); weapon('#C9B8EE', 1);
    // string
    ctx.strokeStyle = '#EDE6FF'; ctx.lineWidth = 0.7 * u; ctx.beginPath(); ctx.moveTo(44 * u, -2 * u); ctx.lineTo(44 * u, -92 * u); ctx.stroke();
    // hand over the grip again so the bow sits inside the fist
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(46 * u, -47 * u, 3.2 * u, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#B98CFF'; ctx.lineWidth = 0.8 * u; ctx.stroke();
    // crescent on the jata
    ctx.fillStyle = '#EDE6FF'; ctx.beginPath(); ctx.arc(-4.5 * u, -92 * u, 2.6 * u, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(-3.4 * u, -92.8 * u, 2.3 * u, 0, 6.283); ctx.fill();
    // three ash lines on the brow, rudraksha beads
    ctx.strokeStyle = '#EDE6FF'; ctx.lineWidth = 0.6 * u; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-2.5 * u, -(85.5 - i * 1.3) * u); ctx.lineTo(4.5 * u, -(85.5 - i * 1.3) * u); ctx.stroke(); }
    ctx.fillStyle = '#B98CFF'; for (let i = 0; i < 14; i++) { const a = Math.PI * (0.15 + 0.7 * i / 13), r = 11 * u; ctx.beginPath(); ctx.arc(Math.cos(a) * r, -(72 - Math.sin(a) * 10) * u, 0.7 * u, 0, 6.283); ctx.fill(); }
    // torn flakes leaving the cloth
    ctx.fillStyle = '#000000';
    for (let i = 0; i < (god ? 16 : 9); i++) { const ph = (t * 0.25 + i * 0.37) % 1, x = (-30 - ph * 40 - i * 2) * u, y = -(6 + i * 3 + ph * 14) * u; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4 * u, y + 2 * u); ctx.lineTo(x - 2 * u, y + 5 * u); ctx.lineTo(x + 2 * u, y + 3 * u); ctx.closePath(); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.restore();
    // third-eye flash in god mode
    if (god) { const g = ctx.createRadialGradient(fx + 1 * u, base - 84 * u, 0, fx + 1 * u, base - 84 * u, u * 18 * (1 + 0.2 * Math.sin(t * 5))); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.2, 'rgba(185,140,255,0.6)'); g.addColorStop(1, 'rgba(139,69,240,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    // vignette
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.hypot(W, H) * 0.6); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  drawManga(ctx, W, H, t, now, god) {
    // Ink Rush v2: a manga page in motion. Streaks race across, panels slide in, SFX pop, ink splats on click.
    if (this.mangaBorn === undefined || this.mangaBorn === 0) { this.mangaBorn = now; this.streaks = []; this.sfx = []; this.splats = []; this.lastSfx = 0; this.lastImpact = 0; }
    const age = (now - this.mangaBorn) / 1000, entry = Math.min(1, age / 1.1), eo = 1 - Math.pow(1 - entry, 3);
    const impact = god && (now - this.lastImpact) > 2600 && (now - this.lastImpact) < 2600 + 90; if (god && now - this.lastImpact > 2700) this.lastImpact = now;
    const BG = impact ? '#FFFFFF' : '#2B7BE4', INK = impact ? '#0B0B0B' : '#0B0B0B', PAPER = impact ? '#0B0B0B' : '#FFFFFF';
    ctx.globalAlpha = 1; ctx.fillStyle = BG; ctx.fillRect(-20, -20, W + 40, H + 40);
    // drifting halftone band
    ctx.save(); ctx.translate((t * 18) % 14, 0); ctx.globalAlpha = impact ? 0.3 : 0.18;
    ctx.drawImage(this.layer('tone2', W + 28, H, (g, w, h) => {
      g.fillStyle = '#0B0B0B'; const st = 14;
      for (let y = 0; y < h; y += st) for (let x = 0; x < w; x += st) { const r = Math.max(0, Math.sin(y / h * Math.PI) * (x / w)) * st * 0.5; if (r > 0.6) { g.beginPath(); g.arc(x + ((y / st) % 2) * st / 2, y, r, 0, 6.283); g.fill(); } }
    }), -14, 0); ctx.restore();
    // comic panels sliding in from the edges, with light parallax to the cursor
    const px = this.emx > -1e3 ? (this.emx / W - 0.5) * 18 : 0, py = this.emy > -1e3 ? (this.emy / H - 0.5) * 12 : 0;
    const panels = [
      { x: 0.56, y: 0.08, w: 0.26, h: 0.34, from: [1, 0], d: 0 },
      { x: 0.84, y: 0.06, w: 0.14, h: 0.52, from: [1, -1], d: 0.1 },
      { x: 0.6, y: 0.48, w: 0.38, h: 0.3, from: [0, 1], d: 0.2 },
      { x: 0.42, y: 0.62, w: 0.15, h: 0.3, from: [-1, 1], d: 0.3 }
    ];
    ctx.lineJoin = 'miter';
    for (const p of panels) {
      const e = Math.min(1, Math.max(0, (age - p.d) / 0.8)), k = 1 - Math.pow(1 - e, 3);
      const ox = p.from[0] * W * 0.6 * (1 - k) + px * (1 + p.d * 3), oy = p.from[1] * H * 0.6 * (1 - k) + py * (1 + p.d * 3);
      const x = p.x * W + ox, y = p.y * H + oy, w = p.w * W, h = p.h * H, sk = (1 - k) * 0.25;
      ctx.save(); ctx.transform(1, 0, -sk, 1, 0, 0);
      ctx.fillStyle = INK; ctx.fillRect(x + 10, y + 10, w, h);
      ctx.fillStyle = PAPER; ctx.fillRect(x, y, w, h);
      ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w, h);
      // inner halftone gradient so the panel isn't flat
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.globalAlpha = 0.35; ctx.drawImage(this.layer('tone2', W + 28, H, () => {}), x - 14 - p.x * W * 0.3, y - p.y * H * 0.3); ctx.restore();
      ctx.restore();
    }
    // speed streaks racing across (diagonal, running-scene style)
    if (this.streaks.length < (god ? 70 : 34) && Math.random() < (god ? 0.9 : 0.5)) {
      this.streaks.push({ y: Math.random() * H, len: 120 + Math.random() * 420, w: 2 + Math.random() * (god ? 7 : 4), v: (1400 + Math.random() * 1800) * (god ? 1.6 : 1), x: -600 - Math.random() * W, k: Math.random() });
    }
    const slope = -0.12;
    for (let i = this.streaks.length - 1; i >= 0; i--) {
      const s = this.streaks[i]; s.x += s.v / 60; if (s.x - s.len > W + 50) { this.streaks.splice(i, 1); continue; }
      const yy = s.y + s.x * slope;
      ctx.fillStyle = s.k < 0.15 ? INK : PAPER; ctx.globalAlpha = s.k < 0.15 ? 0.8 : 0.9;
      ctx.beginPath(); ctx.moveTo(s.x, yy); ctx.lineTo(s.x - s.len, yy - s.len * slope - s.w / 2); ctx.lineTo(s.x - s.len * 0.92, yy - s.len * 0.92 * slope + s.w / 2); ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // radial burst from the cursor on entry and while god mode is on
    if (eo < 1 || god) {
      const cx = this.emx > -1e3 ? this.emx : W * 0.7, cy = this.emy > -1e3 ? this.emy : H * 0.4, Rf = Math.hypot(W, H), nL = god ? 120 : 70;
      ctx.fillStyle = PAPER; ctx.globalAlpha = god ? 0.55 : (1 - eo) * 0.9; ctx.beginPath();
      for (let i = 0; i < nL; i++) { const a = (i / nL) * 6.283 + Math.sin(i * 7.3) * 0.05 + t * 0.15, w = 0.004 + ((i * 37) % 10) / 10 * 0.01, r0 = Math.min(W, H) * (god ? 0.2 : 0.3 + eo * 0.9); ctx.moveTo(cx + Math.cos(a - w) * Rf, cy + Math.sin(a - w) * Rf); ctx.lineTo(cx + Math.cos(a + w) * Rf, cy + Math.sin(a + w) * Rf); ctx.lineTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.closePath(); }
      ctx.fill(); ctx.globalAlpha = 1;
    }
    // SFX pops
    if (now - this.lastSfx > (god ? 700 : 1500)) {
      this.lastSfx = now; const chars = ['ド', 'ゴ', 'バ', 'ズ', 'ダ', 'ッ'];
      const p = panels[(Math.random() * panels.length) | 0];
      this.sfx.push({ ch: chars[(Math.random() * chars.length) | 0], x: (p.x + Math.random() * p.w) * W, y: (p.y + Math.random() * p.h) * H, born: now, rot: (Math.random() - 0.5) * 0.5 });
    }
    this.sfx = this.sfx.filter((f) => now - f.born < 1400);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    for (const f of this.sfx) {
      const l = (now - f.born) / 1400, pop = l < 0.15 ? 1 - Math.pow(1 - l / 0.15, 3) : 1, sc = pop * (1.25 - 0.25 * pop) + (god ? 0.05 * Math.sin(now / 40) : 0);
      const size = Math.min(W, H) * (god ? 0.17 : 0.13) * sc; if (size < 1) continue;
      ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.globalAlpha = l > 0.75 ? (1 - l) / 0.25 : 1;
      ctx.font = size + "px 'Dela Gothic One', sans-serif"; ctx.lineWidth = size * 0.16; ctx.strokeStyle = INK; ctx.strokeText(f.ch, 0, 0); ctx.fillStyle = PAPER; ctx.fillText(f.ch, 0, 0); ctx.restore();
    }
    // ink splats on click
    this.splats = this.splats.filter((sp) => now - sp.born < 900);
    for (const sp of this.splats) {
      const l = (now - sp.born) / 900, grow = 1 - Math.pow(1 - Math.min(1, l * 2.5), 3), R = sp.r * grow;
      ctx.globalAlpha = l > 0.6 ? (1 - l) / 0.4 : 1; ctx.fillStyle = INK; ctx.beginPath();
      for (let k = 0; k <= 40; k++) { const a = k / 40 * 6.283, r = R * (0.75 + 0.25 * Math.sin(a * sp.n + sp.ph) + 0.12 * Math.sin(a * 9 + sp.ph * 2)); ctx.lineTo(sp.x + Math.cos(a) * r, sp.y + Math.sin(a) * r); }
      ctx.closePath(); ctx.fill();
      for (const d of sp.drops) { ctx.beginPath(); ctx.arc(sp.x + d[0] * grow, sp.y + d[1] * grow, d[2], 0, 6.283); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  // Software: Straw Hat. A code-drawn straw hat bobbing over rolling sea bands on red; god mode goes violet with billowing white clouds and a heartbeat.
  // Pages (fitness, hobbies, social): each has its own scene so nothing from Home leaks in.
  drawPageFx(ctx, W, H, t, now, dt, key, god) {
    const G = god ? 1.5 : 1;
    const pg = this.pages()[key] || {}, th = pg.theme || {}, fx = th.fx || 'network', acc = pg.accent || '#FFFFFF';
    const u = Math.min(W, H) / 100, narrow = W < 760, cx = W * (narrow ? 0.5 : 0.72), cy = H * (narrow ? 0.3 : 0.5);
    if (this.fxKey !== key) { this.fxKey = key; this.fxBorn = now; this.uk = null; this.dd = null; this.fxP = []; for (let i = 0; i < 140; i++) this.fxP.push({ x: Math.random(), y: Math.random(), v: 0.3 + Math.random(), w: Math.random() * 6.283, s: 1 + Math.random() * 3, k: i }); this.fxQ = []; }
    const age = (now - this.fxBorn) / 1000, entry = Math.min(1, age / 1.1), eo = 1 - Math.pow(1 - entry, 3);
    ctx.globalAlpha = 1; ctx.fillStyle = th.bg || '#000000'; ctx.fillRect(-20, -20, W + 40, H + 40);
    const stick = (fill, parts) => { ctx.fillStyle = fill; ctx.strokeStyle = fill; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; for (const p of parts) { if (p.c) { ctx.beginPath(); ctx.arc(p.c[0] * u, -p.c[1] * u, p.r * u, 0, 6.283); ctx.fill(); } else if (p.poly) { ctx.beginPath(); p.poly.forEach((q, i) => (i ? ctx.lineTo(q[0] * u, -q[1] * u) : ctx.moveTo(q[0] * u, -q[1] * u))); ctx.closePath(); ctx.fill(); } else { ctx.lineWidth = p.w * u; ctx.beginPath(); p.l.forEach((q, i) => (i ? ctx.lineTo(q[0] * u, -q[1] * u) : ctx.moveTo(q[0] * u, -q[1] * u))); ctx.stroke(); } } };
    const limb = (a, b, w1, w2) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = Math.hypot(dx, dy) || 1, nx = -dy / L2, ny = dx / L2; return { poly: [[a[0] + nx * w1, a[1] + ny * w1], [b[0] + nx * w2, b[1] + ny * w2], [b[0] - nx * w2, b[1] - ny * w2], [a[0] - nx * w1, a[1] - ny * w1]] }; };
    const figure = (parts, x, y, rot, rim) => { ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.save(); ctx.shadowColor = rim; ctx.shadowBlur = 16; stick(rim, parts); ctx.restore(); ctx.save(); ctx.translate(-1.2 * u, 0); stick(rim, parts); ctx.restore(); stick('#050505', parts); ctx.restore(); };

    const paperGrain = (alpha) => { ctx.globalAlpha = alpha; ctx.drawImage(this.grunge, 0, 0, Math.max(W, H), Math.max(W, H)); ctx.globalAlpha = 1; };
    if (fx === 'halftone' || fx === 'halftoneMono') {
      // HALFTONE WAVES. Layered wave bands rendered as a dot grid; each dot takes the colour of the band it falls in. Bands roll slowly.
      const mono = fx === 'halftoneMono'; const cell = Math.max(9, Math.min(13, W / 110)), r0 = cell * 0.42;
      const bands = mono ? ['#0A0A0A', '#2A2A2A', '#4A4A4A', '#8A8A8A', '#CFCFCF', '#FFFFFF', '#8A8A8A', '#2A2A2A'] : ['#0A0A0A', '#3A1E1C', '#5A2A24', '#B8231A', '#E8321E', '#F5742A', '#F7A64C', '#F9D27A', '#E8321E', '#5A2A24'];
      const sp = god ? 1.9 : 1, cols = Math.ceil(W / cell) + 1, rows = Math.ceil(H / cell) + 1;
      const edge = (x, k) => H * (0.12 + k * 0.1) + Math.sin(x * 0.0035 + t * 0.35 * sp + k * 1.3) * H * 0.07 + Math.sin(x * 0.0012 - t * 0.2 * sp + k) * H * 0.05;
      for (let i = 0; i < cols; i++) { const x = i * cell; const edges = []; for (let k = 0; k < bands.length - 1; k++) edges.push(edge(x, k));
        for (let j = 0; j < rows; j++) { const y = j * cell; let b = 0; while (b < edges.length && y > edges[b]) b++; const col = bands[b]; if (col === '#0A0A0A') continue; const shade = 0.75 + 0.25 * Math.sin(x * 0.01 + y * 0.01 + t * sp); ctx.fillStyle = col; ctx.globalAlpha = shade; ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, r0, 0, 6.283); ctx.fill(); } }
      ctx.globalAlpha = 1;
    } else if (fx === 'ukiyo') {
      // UKIYO SKY. Indigo paper, swirl clouds drifting, a golden cloud-trail streaking across, distant karst islands.
      const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#1F4C86'); sky.addColorStop(0.6, '#2C5F9E'); sky.addColorStop(1, '#4A7BB0'); ctx.fillStyle = sky; ctx.fillRect(-20, -20, W + 40, H + 40);
      paperGrain(0.9);
      if (!this.uk) { this.uk = []; for (let i = 0; i < 14; i++) this.uk.push({ x: Math.random(), y: Math.random() * 0.85, s: 0.6 + Math.random() * 1.1, v: 0.004 + Math.random() * 0.008, w: Math.random() * 6.283 }); }
      const cloud = (x, y, sc) => { ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = '#EFE4CB'; ctx.strokeStyle = '#1F4C86'; ctx.lineWidth = 1.6 / sc; ctx.beginPath(); ctx.moveTo(-60 * u * 0.4, 0); for (let k = 0; k < 7; k++) { const cx2 = (-50 + k * 17) * u * 0.4, r = (7 + ((k * 5) % 4) * 2.5) * u * 0.4; ctx.arc(cx2, -r * 0.5, r, Math.PI, 0); } ctx.lineTo(60 * u * 0.4, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.2 / sc; for (let k = 0; k < 3; k++) { const cx2 = (-34 + k * 32) * u * 0.4, cy2 = -8 * u * 0.4; ctx.beginPath(); for (let a = 0; a < 5.6; a += 0.2) { const r = a * 1.2 * u * 0.4; const px = cx2 + Math.cos(a) * r, py = cy2 + Math.sin(a) * r * 0.9; if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke(); } ctx.restore(); };
      for (const c of this.uk) { c.x += dt * c.v * (god ? 2.2 : 1); if (c.x > 1.25) c.x = -0.25; cloud(c.x * W, c.y * H, c.s); }
      // golden trail streak
      const tx = ((t * (god ? 0.32 : 0.16)) % 1.6) - 0.3, ty = H * (0.42 + Math.sin(t * 0.5) * 0.04);
      ctx.save(); ctx.translate(tx * W, ty); ctx.fillStyle = '#E9B94B'; ctx.strokeStyle = '#1F4C86'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-W * 0.55, 0); ctx.quadraticCurveTo(-W * 0.25, -8 * u, 0, -6 * u); ctx.lineTo(0, 8 * u); ctx.quadraticCurveTo(-W * 0.25, 10 * u, -W * 0.55, 4 * u); ctx.closePath(); ctx.fill();
      ctx.beginPath(); for (let k = 0; k < 6; k++) { const cx2 = (-22 + k * 10) * u, r = (6 + ((k * 3) % 3) * 2) * u; ctx.arc(cx2, 0, r, Math.PI, 0); } ctx.lineTo(32 * u, 10 * u); ctx.lineTo(-30 * u, 10 * u); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      // karst islands at the bottom
      ctx.fillStyle = '#3E6B5E'; for (let i = 0; i < 7; i++) { const x = W * (i / 6) + Math.sin(i * 2.3) * 40, w = (14 + (i * 7) % 12) * u, h = (10 + (i * 5) % 14) * u; ctx.beginPath(); ctx.moveTo(x - w, H); ctx.quadraticCurveTo(x - w * 0.5, H - h * 1.3, x, H - h); ctx.quadraticCurveTo(x + w * 0.5, H - h * 1.4, x + w, H); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = 'rgba(31,76,134,0.65)'; ctx.fillRect(0, H * 0.96, W, H * 0.04);
      // red seal stamps in corners
      ctx.fillStyle = '#C9553F'; ctx.fillRect(W * 0.035, H * 0.04, 10 * u, 22 * u); ctx.fillStyle = '#EFE4CB'; ctx.font = 5 * u + "px serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('走', W * 0.035 + 5 * u, H * 0.04 + 8 * u); ctx.fillText('者', W * 0.035 + 5 * u, H * 0.04 + 16 * u);
    } else if (fx === 'cwaves') {
      // CARTOON WAVES. Thick-outlined blue waves with pale foam crests on flat red, rolling in overlapping rows.
      ctx.fillStyle = '#E23B2E'; ctx.fillRect(-20, -20, W + 40, H + 40);
      const rows = 5; for (let r = 0; r < rows; r++) { const yb = H * (0.28 + r * 0.16), ph = t * (0.8 + r * 0.2) * (god ? 1.8 : 1) + r, amp = 12 * u, step = 110 * u * 0.5;
        const path = (yOff) => { ctx.beginPath(); ctx.moveTo(-40, H + 40); ctx.lineTo(-40, yb + yOff); for (let x = -40; x <= W + 40; x += 6) { const base = yb + yOff + Math.sin(x / step * Math.PI * 2 + ph) * amp; const crest = Math.pow(Math.max(0, Math.sin(x / step * Math.PI * 2 + ph)), 6) * 22 * u; ctx.lineTo(x, base - crest); } ctx.lineTo(W + 40, H + 40); ctx.closePath(); };
        path(0); ctx.fillStyle = '#1F8FD6'; ctx.fill(); ctx.strokeStyle = '#0B0B0B'; ctx.lineWidth = 4; ctx.stroke();
        path(5 * u); ctx.fillStyle = '#EAF6FF'; ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#0B5E96'; ctx.lineWidth = 2; for (let x = -40 + ((r * 37) % 60); x <= W + 40; x += 60) { const yy = yb + 5 * u + Math.sin(x / step * Math.PI * 2 + ph) * amp + 18 * u; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + 6, yy + 16 * u); ctx.stroke(); } }
    } else if (fx === 'mosaic') {
      // MOSAIC. Grey geometric key-pattern tiles made of tiny dots on black; tiles shimmer in slow waves.
      ctx.fillStyle = '#060606'; ctx.fillRect(-20, -20, W + 40, H + 40);
      const T2 = Math.max(70, Math.min(110, W / 11)), cols = Math.ceil(W / T2) + 1, rows = Math.ceil(H / T2) + 1;
      const shapes = [(g, size) => { g.strokeRect(size * 0.15, size * 0.15, size * 0.7, size * 0.7); g.strokeRect(size * 0.38, size * 0.38, size * 0.24, size * 0.24); }, (g, size) => { g.beginPath(); g.moveTo(size * 0.5, size * 0.1); g.lineTo(size * 0.9, size * 0.5); g.lineTo(size * 0.5, size * 0.9); g.lineTo(size * 0.1, size * 0.5); g.closePath(); g.stroke(); g.beginPath(); g.arc(size * 0.5, size * 0.5, size * 0.08, 0, 6.283); g.stroke(); }, (g, size) => { g.beginPath(); g.moveTo(size * 0.15, size * 0.85); g.lineTo(size * 0.15, size * 0.15); g.lineTo(size * 0.85, size * 0.15); g.lineTo(size * 0.85, size * 0.6); g.lineTo(size * 0.4, size * 0.6); g.lineTo(size * 0.4, size * 0.4); g.lineTo(size * 0.6, size * 0.4); g.stroke(); }, (g, size) => { g.beginPath(); g.moveTo(size * 0.2, size * 0.2); g.lineTo(size * 0.8, size * 0.2); g.lineTo(size * 0.8, size * 0.8); g.lineTo(size * 0.2, size * 0.8); g.lineTo(size * 0.2, size * 0.45); g.lineTo(size * 0.55, size * 0.45); g.stroke(); }];
      const tile = this.layer('mosaicTile' + Math.round(T2), T2 * 4, T2, (g, w, h) => { g.lineWidth = T2 * 0.16; g.lineCap = 'butt'; g.lineJoin = 'miter'; g.strokeStyle = '#BFBFBF'; for (let k = 0; k < 4; k++) { g.save(); g.translate(k * T2, 0); shapes[k](g, T2); g.restore(); } g.globalCompositeOperation = 'destination-in'; for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) { g.fillStyle = 'rgba(255,255,255,' + (0.55 + Math.random() * 0.45) + ')'; g.beginPath(); g.arc(x + 1.5, y + 1.5, 1.15, 0, 6.283); g.fill(); } });
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const k = (i * 7 + j * 3 + ((i * j) % 2)) % 4, shade = 0.35 + 0.45 * Math.pow(Math.sin(t * (god ? 1.6 : 0.6) + i * 0.6 + j * 0.9), 2); ctx.globalAlpha = shade; ctx.drawImage(tile, k * T2, 0, T2, T2, i * T2 + (j % 2 ? T2 / 2 : 0) - T2 / 2, j * T2, T2, T2); }
      ctx.globalAlpha = 1; paperGrain(0.35);
    } else if (fx === 'doodle') {
      // DOODLE. Bold-outlined shapes (eyes, teeth arcs, clouds, zigzags, striped pills) packed across the screen; full colour on the left fading to grey on the right.
      ctx.fillStyle = '#3B3B3B'; ctx.fillRect(-20, -20, W + 40, H + 40);
      if (!this.dd) { this.dd = []; const cell = 90 * u * 0.6; for (let y = 0; y < H + cell; y += cell) for (let x = 0; x < W + cell; x += cell) this.dd.push({ x: x + (Math.random() - 0.5) * cell * 0.5, y: y + (Math.random() - 0.5) * cell * 0.5, k: (Math.random() * 6) | 0, r: cell * (0.45 + Math.random() * 0.35), w: Math.random() * 6.283, c: (Math.random() * 4) | 0 }); }
      const pal = ['#E63329', '#5BC4D9', '#A5C44A', '#F5EBCB'], grey = ['#5A5A5A', '#777777', '#9A9A9A', '#C4C4C4'];
      const split = W * (0.52 + Math.sin(t * 0.3) * 0.04);
      ctx.lineWidth = 3; ctx.strokeStyle = '#0B0B0B'; ctx.lineJoin = 'round';
      for (const d of this.dd) { const colour = d.x < split, P = colour ? pal : grey, fill = P[d.c], acc2 = P[(d.c + 1) % 4], bob = Math.sin(t * (god ? 2.4 : 1.1) + d.w) * 3 * u; ctx.save(); ctx.translate(d.x, d.y + bob); ctx.fillStyle = fill; const r = d.r;
        if (d.k === 0) { ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#F5EBCB'; ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#0B0B0B'; ctx.beginPath(); ctx.arc(r * 0.06, 0, r * 0.12, 0, 6.283); ctx.fill(); }
        else if (d.k === 1) { ctx.beginPath(); ctx.arc(0, 0, r * 0.6, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#F5EBCB'; for (let k = 0; k < 5; k++) { ctx.fillRect(-r * 0.5 + k * r * 0.2, -r * 0.3, r * 0.17, r * 0.28); ctx.strokeRect(-r * 0.5 + k * r * 0.2, -r * 0.3, r * 0.17, r * 0.28); } }
        else if (d.k === 2) { ctx.beginPath(); for (let k = 0; k < 5; k++) ctx.arc(-r * 0.4 + k * r * 0.2, Math.sin(k * 1.3) * r * 0.1, r * 0.22, 0, 6.283); ctx.fill(); ctx.stroke(); }
        else if (d.k === 3) { ctx.beginPath(); ctx.moveTo(-r * 0.6, 0); for (let k = 0; k <= 6; k++) ctx.lineTo(-r * 0.6 + k * r * 0.2, (k % 2 ? -1 : 1) * r * 0.25); ctx.lineTo(r * 0.6, r * 0.45); ctx.lineTo(-r * 0.6, r * 0.45); ctx.closePath(); ctx.fill(); ctx.stroke(); }
        else if (d.k === 4) { ctx.beginPath(); ctx.roundRect(-r * 0.25, -r * 0.6, r * 0.5, r * 1.2, r * 0.25); ctx.fill(); ctx.stroke(); ctx.fillStyle = acc2; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(0, -r * 0.4 + k * r * 0.27, r * 0.1, 0, 6.283); ctx.fill(); ctx.stroke(); } }
        else { ctx.beginPath(); ctx.moveTo(0, -r * 0.6); ctx.lineTo(r * 0.55, r * 0.35); ctx.lineTo(-r * 0.55, r * 0.35); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = acc2; ctx.beginPath(); ctx.arc(0, r * 0.05, r * 0.18, 0, 6.283); ctx.fill(); ctx.stroke(); }
        ctx.restore(); }
      // split edge
      ctx.strokeStyle = '#0B0B0B'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(split, -20); for (let y = -20; y <= H + 20; y += 40) ctx.lineTo(split + ((y / 40) % 2 ? 14 : -14), y); ctx.stroke();
    } else if (fx === 'iron') {
      // THE RACK. A lifter squats under a loaded bar; the bar bends, plates clank, chalk puffs at lockout.
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1; for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 48) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      const floorY = H * 0.78; ctx.fillStyle = '#121418'; ctx.fillRect(0, floorY, W, H - floorY); ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, floorY); ctx.lineTo(W, floorY); ctx.stroke();
      // rack uprights
      for (const sx of [-1, 1]) { ctx.fillStyle = '#2A2E34'; ctx.fillRect(cx + sx * 58 * u - 2.5 * u, floorY - 92 * u, 5 * u, 92 * u); ctx.fillStyle = '#3A3F47'; for (let k = 0; k < 9; k++) ctx.fillRect(cx + sx * 58 * u - 1 * u, floorY - 88 * u + k * 10 * u, 2 * u, 2 * u); }
      // squat cycle: down 40%, pause, up 40%, lockout
      const cyc = (t * 0.35) % 1, down = cyc < 0.4 ? cyc / 0.4 : cyc < 0.5 ? 1 : cyc < 0.9 ? 1 - (cyc - 0.5) / 0.4 : 0, e = down < 0.5 ? 2 * down * down : 1 - Math.pow(-2 * down + 2, 2) / 2;
      const hipDrop = e * 26, knee = e * 18, barY = floorY - (70 - hipDrop) * u, flex = (4 + e * 3) * u * (1 + 0.15 * Math.sin(t * 20) * (cyc > 0.88 && cyc < 0.95 ? 1 : 0));
      const lifter = [
        { l: [[-6, 0], [-8 - knee, 16 - e * 4], [-5, 40 - hipDrop]], w: 7 }, { l: [[6, 0], [8 + knee, 16 - e * 4], [5, 40 - hipDrop]], w: 7 },
        { poly: [[-9, 38 - hipDrop], [9, 38 - hipDrop], [10, 64 - hipDrop - e * 2], [-10, 64 - hipDrop - e * 2]] },
        { c: [0, 72 - hipDrop - e * 2], r: 6.8 },
        { l: [[-9, 62 - hipDrop], [-20, 70 - hipDrop], [-26, 74 - hipDrop]], w: 5.6 }, { l: [[9, 62 - hipDrop], [20, 70 - hipDrop], [26, 74 - hipDrop]], w: 5.6 }
      ];
      // bar + plates
      ctx.strokeStyle = '#C9D3DD'; ctx.lineWidth = 1.8 * u; ctx.beginPath(); ctx.moveTo(cx - 46 * u, barY); ctx.quadraticCurveTo(cx, barY + flex, cx + 46 * u, barY); ctx.stroke();
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const px = cx + sd * (32 + k * 4.4) * u, h = (18 - k * 3.5) * u, sag = flex * (1 - k * 0.25) * 0.4; ctx.fillStyle = k === 0 ? acc : '#2E3238'; ctx.strokeStyle = '#0E1013'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(px - 2 * u, barY + sag - h, 4 * u, h * 2, 1.4 * u); ctx.fill(); ctx.stroke(); }
      // chalk puff at lockout, clank shake at the bottom
      if (cyc > 0.9 && cyc < 0.93 && Math.random() < 0.5) for (let k = 0; k < 4; k++) this.fxQ.push({ x: cx + (Math.random() - 0.5) * 50 * u, y: barY - 4 * u, vx: (Math.random() - 0.5) * 60 * u / 100, vy: -(20 + Math.random() * 40) * u / 100, life: 1, r: 3 + Math.random() * 4 });
      this.fxQ = this.fxQ.filter((q) => q.life > 0); ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (const q of this.fxQ) { q.life -= dt * 0.9; q.x += q.vx * dt; q.y += q.vy * dt; q.r += dt * 8; ctx.globalAlpha = q.life * 0.5; ctx.beginPath(); ctx.arc(q.x, q.y, q.r * u * 0.3, 0, 6.283); ctx.fill(); }
      ctx.globalAlpha = 1;
      // rep counter
      ctx.fillStyle = acc; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = 9 * u + "px 'Anton', sans-serif"; ctx.fillText('REP ' + (Math.floor(t * 0.35) % 5 + 1) + ' / 5', cx - 46 * u, floorY - 100 * u);

    } else if (fx === 'network') {
      // LINKEDIN: a professional graph. Nodes drift, edges form when close, pulses travel along them.
      const N = this.fxP.slice(0, 34); for (const q of N) { q.x += Math.cos(q.w + t * 0.2) * dt * 0.02; q.y += Math.sin(q.w * 1.3 + t * 0.17) * dt * 0.02; if (q.x < 0) q.x += 1; if (q.x > 1) q.x -= 1; if (q.y < 0) q.y += 1; if (q.y > 1) q.y -= 1; }
      ctx.lineWidth = 1;
      for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) { const dx = (N[i].x - N[j].x) * W, dy = (N[i].y - N[j].y) * H, d = Math.hypot(dx, dy); if (d < 180) { ctx.strokeStyle = acc; ctx.globalAlpha = (1 - d / 180) * 0.5; ctx.beginPath(); ctx.moveTo(N[i].x * W, N[i].y * H); ctx.lineTo(N[j].x * W, N[j].y * H); ctx.stroke(); const p = (t * 0.5 + i * 0.37 + j * 0.11) % 1; ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha = (1 - d / 180); ctx.beginPath(); ctx.arc(N[i].x * W + (N[j].x - N[i].x) * W * p, N[i].y * H + (N[j].y - N[i].y) * H * p, 1.6, 0, 6.283); ctx.fill(); } }
      ctx.globalAlpha = 1; for (const q of N) { ctx.fillStyle = th.bg; ctx.beginPath(); ctx.arc(q.x * W, q.y * H, q.s * 2.2, 0, 6.283); ctx.fill(); ctx.strokeStyle = acc; ctx.lineWidth = 1.5; ctx.stroke(); }
      // you, at the centre, with a growing ring of "connections"
      ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(cx, cy, 6 * u, 0, 6.283); ctx.fill(); ctx.strokeStyle = acc; ctx.lineWidth = 2; for (let k = 0; k < 2; k++) { const p = (t * 0.35 + k * 0.5) % 1; ctx.globalAlpha = 1 - p; ctx.beginPath(); ctx.arc(cx, cy, 6 * u + p * 30 * u, 0, 6.283); ctx.stroke(); } ctx.globalAlpha = 1;

    } else if (fx === 'heatmap') {
      // GITHUB: a contribution graph filling in week by week, with commits dropping into cells.
      const cell = Math.max(10, Math.min(16, W / 70)), gap = 3, cols = Math.floor((W * 0.9) / (cell + gap)), rows = 7, ox = W * 0.05, oy = cy - (rows * (cell + gap)) / 2;
      const prog = (t * 0.12) % 1.3, lit = Math.floor(prog * cols);
      for (let c2 = 0; c2 < cols; c2++) for (let r = 0; r < rows; r++) { const seed = Math.sin(c2 * 12.9898 + r * 78.233) * 43758.5453, v = seed - Math.floor(seed), lvl = c2 < lit ? (v > 0.8 ? 4 : v > 0.55 ? 3 : v > 0.35 ? 2 : v > 0.2 ? 1 : 0) : 0; ctx.fillStyle = lvl === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(141,230,163,' + (0.25 + lvl * 0.18) + ')'; if (c2 === lit - 1) ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(ox + c2 * (cell + gap), oy + r * (cell + gap), cell, cell, 2); ctx.fill(); }
      // commit dots falling into the newest column
      if (lit < cols && Math.random() < 0.3) this.fxQ.push({ x: ox + (lit) * (cell + gap) + cell / 2, y: oy - 60, vy: 120, life: 1, r: 2 });
      this.fxQ = this.fxQ.filter((q) => q.life > 0); ctx.fillStyle = '#8DE6A3';
      for (const q of this.fxQ) { q.y += q.vy * dt * 3; if (q.y > oy) q.life = 0; ctx.beginPath(); ctx.arc(q.x, q.y, 2.5, 0, 6.283); ctx.fill(); }
      ctx.fillStyle = th.muted || '#999'; ctx.font = 3.2 * u + "px 'Geist Mono', monospace"; ctx.textAlign = 'left'; ctx.fillText((lit * 7 * 2) + ' contributions in the last year', ox, oy + rows * (cell + gap) + 6 * u);

    } else if (fx === 'play') {
      // YOUTUBE: a play button that pulses on a beat, with an equaliser and a waveform scrubbing.
      const beat = Math.pow(Math.max(0, Math.sin(t * 4.2)), 6), R = (26 + 3 * beat) * u;
      ctx.fillStyle = acc; ctx.beginPath(); ctx.roundRect(cx - R * 1.4, cy - R, R * 2.8, R * 2, R * 0.45); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(cx - R * 0.35, cy - R * 0.5); ctx.lineTo(cx + R * 0.55, cy); ctx.lineTo(cx - R * 0.35, cy + R * 0.5); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 2; k++) { const p = (t * 0.7 + k * 0.5) % 1; ctx.strokeStyle = acc; ctx.globalAlpha = 1 - p; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(cx - R * 1.4 - p * 24 * u, cy - R - p * 20 * u, R * 2.8 + p * 48 * u, R * 2 + p * 40 * u, R * 0.5 + p * 10 * u); ctx.stroke(); } ctx.globalAlpha = 1;
      // equaliser bars along the bottom
      const n = Math.floor(W / 18); for (let i = 0; i < n; i++) { const h = (8 + Math.abs(Math.sin(t * 3 + i * 0.4)) * 40 + Math.abs(Math.sin(t * 7.3 + i * 1.7)) * 20) * (0.5 + beat * 0.5); ctx.fillStyle = i % 6 === 0 ? '#FFFFFF' : acc; ctx.globalAlpha = 0.6; ctx.fillRect(i * 18 + 4, H * 0.86 - h, 10, h); }
      ctx.globalAlpha = 1;
      // progress scrub
      const p = (t * 0.08) % 1; ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(W * 0.1, H * 0.9, W * 0.8, 4); ctx.fillStyle = acc; ctx.fillRect(W * 0.1, H * 0.9, W * 0.8 * p, 4); ctx.beginPath(); ctx.arc(W * 0.1 + W * 0.8 * p, H * 0.9 + 2, 7, 0, 6.283); ctx.fill();
    }
    if (god) { const gp = 0.5 + 0.5 * Math.sin(t * 3); const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, acc); ctx.globalAlpha = 0.18 + 0.12 * gp; ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    if (eo < 1) { ctx.globalAlpha = (1 - eo) * 0.9; ctx.fillStyle = acc; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.globalAlpha = 1; }
  }

  drawPirate(ctx, W, H, t, now, god) {
    if (!this.hat) { this.hat = { vy: 0, y: 0, born: now, clouds: [] }; for (let i = 0; i < 26; i++) this.hat.clouds.push({ a: Math.random() * 6.283, r: 0.6 + Math.random() * 0.9, s: 0.5 + Math.random(), w: Math.random() * 6.283 }); }
    const narrow = W < 760, cx = W * (narrow ? 0.5 : 0.7), cy = H * (narrow ? 0.3 : 0.44), u = Math.min(W, H) / 100;
    const gm = god ? Math.min(1, (now - (this.godAt || now)) / 700) : 0;
    // hat physics: a rubbery bounce that settles
    const h = this.hat; h.vy += (0 - h.y) * 0.08 - h.vy * 0.08; h.y += h.vy;
    const bob = Math.sin(t * 1.6) * 1.2 * u + h.y, beat = god ? 1 + 0.06 * Math.pow(Math.max(0, Math.sin(t * 6.3)), 8) + 0.04 * Math.pow(Math.max(0, Math.sin(t * 6.3 - 0.6)), 8) : 1;
    const sq = 1 - h.vy * 0.004, st = 1 + h.vy * 0.004;
    // background
    const bgR = [214, 59, 50], bgP = [142, 68, 236], bg = bgR.map((c, i) => Math.round(c + (bgP[i] - c) * gm));
    ctx.globalAlpha = 1; ctx.fillStyle = 'rgb(' + bg.join(',') + ')'; ctx.fillRect(-20, -20, W + 40, H + 40);
    // sun burst behind the hat (paper tone)
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.05); ctx.fillStyle = god ? 'rgba(255,255,255,0.12)' : 'rgba(255,244,223,0.1)'; ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, w = 0.09; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - w) * W, Math.sin(a - w) * W); ctx.lineTo(Math.cos(a + w) * W, Math.sin(a + w) * W); }
    ctx.fill(); ctx.restore();
    // god mode clouds: puffy white rings billowing out
    if (gm > 0) {
      ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#2A0E0C'; ctx.lineWidth = 3;
      for (const c of h.clouds) {
        const p = ((t * 0.12 * c.s + c.w) % 1), r = (18 + p * 60) * u * c.r, x = cx + Math.cos(c.a + t * 0.1) * r, y = cy + 6 * u + Math.sin(c.a + t * 0.1) * r * 0.55;
        const size = (4 + 7 * (1 - p)) * u * gm; if (size < 1) continue;
        ctx.globalAlpha = Math.min(1, (1 - p) * 1.4) * gm; ctx.beginPath();
        for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283 + c.w; ctx.moveTo(x + Math.cos(a) * size * 0.6 + size * 0.5, y + Math.sin(a) * size * 0.5); ctx.arc(x + Math.cos(a) * size * 0.6, y + Math.sin(a) * size * 0.5, size * 0.5, 0, 6.283); }
        ctx.fill(); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    // rolling sea bands at the bottom (cream on red, white on violet)
    const bands = 3;
    for (let b = 0; b < bands; b++) {
      const yb = H * (0.74 + b * 0.09), amp = (2.2 + b) * u, k = 0.012 - b * 0.002, ph = t * (1.1 + b * 0.35) + b;
      ctx.fillStyle = b % 2 ? 'rgb(' + bg.join(',') + ')' : (god ? '#FFFFFF' : '#FFF4DF'); ctx.beginPath(); ctx.moveTo(-20, H + 20);
      for (let x = -20; x <= W + 20; x += 12) ctx.lineTo(x, yb + Math.sin(x * k + ph) * amp + Math.sin(x * k * 2.3 - ph * 1.4) * amp * 0.4);
      ctx.lineTo(W + 20, H + 20); ctx.closePath(); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#2A0E0C'; ctx.beginPath();
      for (let x = -20; x <= W + 20; x += 12) { const y = yb + Math.sin(x * k + ph) * amp + Math.sin(x * k * 2.3 - ph * 1.4) * amp * 0.4; if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    }
    // the straw hat
    ctx.save(); ctx.translate(cx, cy + bob); ctx.scale(st * beat, sq * beat); ctx.rotate(Math.sin(t * 0.9) * 0.04);
    const straw = god ? '#F3E3B0' : '#E8B85A', strawDark = god ? '#D9C48C' : '#C9953F', band = god ? '#8E44EC' : '#C9302A', ink = '#2A0E0C';
    ctx.lineWidth = 3.2; ctx.strokeStyle = ink; ctx.lineJoin = 'round';
    // shadow under the hat
    ctx.fillStyle = 'rgba(42,14,12,0.25)'; ctx.beginPath(); ctx.ellipse(0, 34 * u, 30 * u, 5 * u, 0, 0, 6.283); ctx.fill();
    // brim
    ctx.fillStyle = straw; ctx.beginPath(); ctx.ellipse(0, 8 * u, 38 * u, 11 * u, 0, 0, 6.283); ctx.fill(); ctx.stroke();
    ctx.fillStyle = strawDark; ctx.beginPath(); ctx.ellipse(0, 8 * u, 38 * u, 11 * u, 0, 0, Math.PI); ctx.ellipse(0, 7 * u, 38 * u, 8 * u, 0, Math.PI, 0, true); ctx.fill();
    // crown
    ctx.fillStyle = straw; ctx.beginPath(); ctx.moveTo(-23 * u, 6 * u); ctx.bezierCurveTo(-26 * u, -14 * u, -14 * u, -27 * u, 0, -27 * u); ctx.bezierCurveTo(14 * u, -27 * u, 26 * u, -14 * u, 23 * u, 6 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
    // straw lines
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(42,14,12,0.45)';
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 6 * u, -24 * u + Math.abs(i) * 1.5 * u); ctx.quadraticCurveTo(i * 7 * u, -10 * u, i * 7.5 * u, 2 * u); ctx.stroke(); }
    for (let i = 0; i < 9; i++) { const a = -0.2 - i * 0.3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 26 * u, 8 * u + Math.sin(a) * 7 * u); ctx.lineTo(Math.cos(a) * 36 * u, 8 * u + Math.sin(a) * 10 * u); ctx.stroke(); }
    // band
    ctx.lineWidth = 3.2; ctx.strokeStyle = ink; ctx.fillStyle = band; ctx.beginPath(); ctx.moveTo(-23.5 * u, 6 * u); ctx.bezierCurveTo(-10 * u, 12 * u, 10 * u, 12 * u, 23.5 * u, 6 * u); ctx.lineTo(24 * u, 1 * u); ctx.bezierCurveTo(10 * u, 7 * u, -10 * u, 7 * u, -24 * u, 1 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
    // top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-6 * u, -19 * u, 9 * u, 4 * u, -0.4, 0, 6.283); ctx.fill();
    ctx.restore();
    // SFX on bounce
    if (Math.abs(h.vy) > 2.5 && now - (this.lastDon || 0) > 600) { this.lastDon = now; (this.sfx = this.sfx || []).push({ ch: god ? 'ドン!!' : 'ドン!', x: cx + (Math.random() - 0.5) * 30 * u, y: cy - 40 * u, born: now, rot: (Math.random() - 0.5) * 0.4 }); }
    this.sfx = (this.sfx || []).filter((f) => now - f.born < 1100);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const f of this.sfx) { const l = (now - f.born) / 1100, pop = l < 0.15 ? 1 - Math.pow(1 - l / 0.15, 3) : 1, size = 11 * u * pop * (1.3 - 0.3 * pop); ctx.save(); ctx.translate(f.x, f.y - l * 30 * u); ctx.rotate(f.rot); ctx.globalAlpha = l > 0.7 ? (1 - l) / 0.3 : 1; ctx.font = size + "px 'Bangers', sans-serif"; ctx.lineWidth = size * 0.18; ctx.strokeStyle = '#2A0E0C'; ctx.strokeText(f.ch, 0, 0); ctx.fillStyle = '#FFF4DF'; ctx.fillText(f.ch, 0, 0); ctx.restore(); }
    ctx.globalAlpha = 1;
    // god mode: white flash on entry
    if (gm > 0 && gm < 1) { ctx.globalAlpha = (1 - gm) * 0.8; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-20, -20, W + 40, H + 40); ctx.globalAlpha = 1; }
  }

  drawVortex(ctx, W, H, t, now, dt, god) {
    const cx = W * 0.68 + (this.emx > -1e3 ? (this.emx - W * 0.68) * 0.08 : 0), cy = H * 0.48 + (this.emy > -1e3 ? (this.emy - H * 0.48) * 0.08 : 0);
    const Rm = Math.hypot(W, H) * 0.62;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rm);
    g.addColorStop(0, '#C9B3F0'); g.addColorStop(0.18, '#8A5BD6'); g.addColorStop(0.5, '#4B2593'); g.addColorStop(1, '#1A0A36');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
    const V = this.vx, n = god ? V.n : Math.floor(V.n * 0.5), sp = god ? 1.9 : 1;
    ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? 'rgba(255,255,255,0.55)' : 'rgba(201,179,240,0.4)'; ctx.beginPath();
      for (let i = pass; i < n; i += 2) {
        const r0 = V.r[i];
        V.a[i] += dt * (0.18 + 0.7 / (r0 * 3 + 0.35)) * sp; V.r[i] -= dt * 0.025 * sp;
        if (V.r[i] < 0.03) { V.r[i] = 1 + Math.random() * 0.1; V.a[i] = Math.random() * 6.283; }
        const r = V.r[i] * Rm, a = V.a[i], len = 0.05 + 0.08 / (r0 + 0.2);
        ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.86);
        ctx.lineTo(cx + Math.cos(a - len) * r, cy + Math.sin(a - len) * r * 0.86);
      }
      ctx.stroke();
    }
    if (now - this.lastBolt > (god ? 380 : 1300)) {
      this.lastBolt = now; const ang = Math.random() * 6.283; let r = Rm * 0.75; const pts = [];
      let a = ang;
      for (let k = 0; k < 16 && r > 30; k++) { pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.86]); r -= Rm * (0.03 + Math.random() * 0.05); a += (Math.random() - 0.5) * 0.35; }
      this.bolts.push({ pts, born: now });
    }
    this.bolts = this.bolts.filter((b) => now - b.born < 280);
    ctx.save(); ctx.shadowColor = '#E8DBFF'; ctx.shadowBlur = 14; ctx.strokeStyle = '#FFFFFF';
    for (const b of this.bolts) {
      ctx.globalAlpha = 1 - (now - b.born) / 280; ctx.lineWidth = god ? 3 : 2; ctx.beginPath();
      b.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  drawSun(ctx, W, H, t, dt, god) {
    // Solar seal: a hand-carved sun with wavy flame rays and a spiral core, glowing on a deep night sky.
    const narrow = W < 760, cx = W * (narrow ? 0.5 : 0.7) + (this.emx > -1e3 ? (this.emx - W * 0.7) * 0.04 : 0), cy = H * (narrow ? 0.3 : 0.46) + (this.emy > -1e3 ? (this.emy - H * 0.46) * 0.04 : 0);
    const R0 = Math.min(W, H) * (narrow ? 0.2 : 0.17) * (god ? 1.12 : 1);
    const sky = ctx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#060D18'); sky.addColorStop(1, '#13223A');
    ctx.globalAlpha = 1; ctx.fillStyle = sky; ctx.fillRect(-20, -20, W + 40, H + 40);
    // drifting motes
    const M = this.mo, n = god ? M.n : Math.floor(M.n * 0.35), sp = god ? 1.6 : 0.7;
    ctx.fillStyle = '#F2C14E';
    for (let i = 0; i < n; i++) {
      M.y[i] -= M.v[i] * dt * sp; if (M.y[i] < -0.02) { M.y[i] = 1.02; M.x[i] = Math.random(); }
      ctx.globalAlpha = 0.15 + 0.4 * Math.sin(t * 1.6 + i) ** 2; const s = M.s[i] * 0.8; ctx.fillRect(M.x[i] * W + Math.sin(t * 0.7 + i) * 8, M.y[i] * H, s, s);
    }
    // halo
    const pulse = 1 + 0.06 * Math.sin(t * 1.4) + (god ? 0.08 * Math.sin(t * 5) : 0);
    const halo = ctx.createRadialGradient(cx, cy, R0 * 0.6, cx, cy, R0 * 3.2 * pulse);
    halo.addColorStop(0, 'rgba(242,193,78,' + (god ? 0.55 : 0.38) + ')'); halo.addColorStop(0.4, 'rgba(242,193,78,0.12)'); halo.addColorStop(1, 'rgba(242,193,78,0)');
    ctx.globalAlpha = 1; ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
    // rays: a wavy flame silhouette
    const rays = 14, rot = t * (god ? 0.22 : 0.08);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.shadowColor = 'rgba(255,220,120,0.9)'; ctx.shadowBlur = god ? 50 : 30;
    ctx.fillStyle = '#F7D97A';
    ctx.beginPath();
    const steps = rays * 24;
    for (let k = 0; k <= steps; k++) {
      const a = (k / steps) * Math.PI * 2, ph = a * rays;
      const tip = Math.pow(Math.max(0, Math.sin(ph)), 3), wob = Math.sin(a * 3 + t * 1.8) * 0.06 + Math.sin(ph * 0.5 + t * 2.6) * 0.04;
      const r = R0 * (1.05 + 0.75 * tip + wob + (god ? 0.2 * tip * Math.sin(t * 6 + a * 2) : 0));
      const x = Math.cos(a) * r, y = Math.sin(a) * r; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    // disc + carved rings
    const disc = ctx.createRadialGradient(0, 0, 0, 0, 0, R0 * 1.05); disc.addColorStop(0, '#FFF6D4'); disc.addColorStop(0.7, '#F6D170'); disc.addColorStop(1, '#E6A93A');
    ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(0, 0, R0 * 1.05, 0, 6.283); ctx.fill();
    ctx.strokeStyle = 'rgba(140,80,20,0.55)'; ctx.lineWidth = R0 * 0.045; ctx.beginPath(); ctx.arc(0, 0, R0 * 0.82, 0, 6.283); ctx.stroke();
    // spiral core, carved
    ctx.rotate(-rot * 2.2);
    ctx.lineCap = 'round'; ctx.lineWidth = R0 * 0.07; ctx.strokeStyle = 'rgba(140,80,20,0.75)'; ctx.beginPath();
    for (let k = 0; k <= 160; k++) { const a = k / 160 * Math.PI * 2 * 2.6, r = R0 * 0.62 * (k / 160); const x = Math.cos(a) * r, y = Math.sin(a) * r; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.restore();
    // solar flares in god mode
    if (god && Math.random() < 0.08) { this.bolts.push({ a: Math.random() * 6.283, born: t * 1000 }); }
    if (god) {
      this.bolts = this.bolts.filter((b) => t * 1000 - b.born < 600);
      for (const b of this.bolts) { const p = (t * 1000 - b.born) / 600, r1 = R0 * (1.2 + p * 2.4); ctx.globalAlpha = (1 - p) * 0.7; ctx.strokeStyle = '#FFE9A8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r1, b.a - 0.3, b.a + 0.3); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }

  drawEmber(ctx, W, H, god) {
    const c = god ? 8 : 10;
    ctx.globalAlpha = 1;
    ctx.drawImage(this.layer('cells' + c, W, H, (g, w, h) => {
      g.fillStyle = '#4A0604'; g.fillRect(0, 0, w, h);
      const reds = ['#8E0E0B', '#9C120E', '#82100C', '#A3150F'];
      for (let y = 0; y < h; y += c) for (let x = 0; x < w; x += c) { g.fillStyle = reds[(Math.random() * 4) | 0]; g.fillRect(x, y, c - 1, c - 1); }
    }), 0, 0);
    const cols = Math.ceil(W / c), rows = Math.ceil((H / c) * (god ? 0.9 : 0.5));
    if (!this.fire || this.fire.cols !== cols || this.fire.rows !== rows) {
      const f = new Uint8Array(cols * rows); for (let x = 0; x < cols; x++) f[(rows - 1) * cols + x] = 36;
      this.fire = { f, cols, rows };
    }
    const F = this.fire.f;
    for (let x = 0; x < cols; x++) for (let y = 1; y < rows; y++) {
      const src = y * cols + x, v = F[src];
      if (v === 0) { if (src - cols >= 0) F[src - cols] = 0; continue; }
      const rnd = Math.round(Math.random() * 3) & 3, dst = src - rnd + 1 - cols;
      if (dst >= 0 && dst < F.length) F[dst] = Math.max(0, v - (rnd & 1));
    }
    const top = H - rows * c;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const v = F[y * cols + x]; if (v < 3) continue;
      ctx.fillStyle = this.palette[v]; ctx.fillRect(x * c, top + y * c, c - 1, c - 1);
    }
    const mx = this.emx, my = this.emy;
    if (mx > -1e3) {
      ctx.fillStyle = '#F5A623';
      for (let k = 0; k < 6; k++) { ctx.globalAlpha = Math.random(); ctx.fillRect(Math.floor((mx + (Math.random() - 0.5) * 60) / c) * c, Math.floor((my + (Math.random() - 0.5) * 60) / c) * c, c - 1, c - 1); }
      ctx.globalAlpha = 1;
    }
  }
}
