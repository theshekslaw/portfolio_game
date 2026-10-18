import { STACK_ICONS } from '@/lib/stackIcons';
import type { Theme } from '@/lib/types';

// Relative luminance of a #RRGGBB colour, to swap near-black brand marks for the theme ink on dark tiles.
const luminance = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const initials = (label: string) => label.split(/[^A-Za-z0-9]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

// Stack shown as small logo cards, skinned with the theme's tag tokens.
export default function StackTiles({ th, stack }: { th: Theme; stack: string[] }) {
  return (
    <div className="rise3" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: th.muted }}>Stack</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {stack.map((t) => {
          const icon = STACK_ICONS[t];
          const color = icon && luminance(icon.hex) > 0.18 ? `#${icon.hex}` : th.tagInk;
          return (
            <div key={t} title={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, width: 92, minHeight: 78, padding: '10px 6px', boxSizing: 'border-box', border: th.tagBorder, borderRadius: th.radius, background: th.tagBg, color: th.tagInk }}>
              {icon ? (
                <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill={color} /></svg>
              ) : (
                <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 999, border: `1.5px solid ${th.tagInk}`, fontSize: 10, fontWeight: 700 }}>{initials(t)}</span>
              )}
              <span style={{ fontSize: 11, lineHeight: 1.2, textAlign: 'center', fontWeight: 500 }}>{t}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
