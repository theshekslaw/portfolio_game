import type { Quote } from '@/lib/quotes';

// Today's quote, under a view's intro.
export default function QuoteBlock({ quote, accent, ink, muted, font }: { quote: Quote; accent: string; ink: string; muted: string; font: string }) {
  return (
    <figure className="rise3" style={{ alignSelf: 'flex-start', margin: 0, maxWidth: 620, padding: '10px 16px', borderLeft: `3px solid ${accent}`, background: 'rgba(0,0,0,0.45)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
      <blockquote style={{ margin: 0, fontFamily: font, fontSize: 17, lineHeight: 1.45, fontStyle: 'italic', color: ink }}>“{quote.text}”</blockquote>
      <figcaption style={{ marginTop: 6, fontSize: 12, letterSpacing: '0.06em', color: muted }}>— {quote.by}</figcaption>
    </figure>
  );
}
