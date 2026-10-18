export type ModeKey = 'home' | 'software' | 'ml' | 'cloud' | 'llmops';

export interface WorkItem {
  tag: string;
  title: string;
  note: string;
  meta: string;
  href: string;
}

// One skin. Professions define every field; a content page overrides fx/bg/ink/muted/display/body on top of `home`.
export interface Theme {
  label: string;
  domain: string;
  mode: string;
  num: string;
  border2: string;
  ringColor: string;
  work?: WorkItem[];
  display: string;
  body: string;
  headSize: string;
  headTrack: string;
  bg: string;
  ink: string;
  muted: string;
  head: string;
  headShadow: string;
  godShadow: string;
  wipe: string;
  tagBg: string;
  tagInk: string;
  tagBorder: string;
  subBg: string;
  subPad: string;
  subBorder: string;
  tabBg: string;
  tabInk: string;
  tabOnBg: string;
  tabOnInk: string;
  tabBorder: string;
  tabRadius: string;
  chipBg: string;
  chipBorder: string;
  chipInk: string;
  panel: string;
  border: string;
  radius: string;
  shadow: string;
  cardInk: string;
  cardMuted: string;
  cardTag: string;
  title: string;
  sub: string;
  chips: string[];
  swatch: string[];
  fx?: string;
}

export interface PageTheme {
  fx: string;
  bg: string;
  ink: string;
  muted: string;
  display: string;
  body: string;
}

export interface PageNow {
  value: string;
  meta: string;
  note: string;
  type?: string;
  typeBg?: string;
  progressLabel?: string;
  progress?: string;
}

export interface PageItem {
  tag: string;
  title: string;
  note: string;
  type?: string;
  typeBg?: string;
}

export interface Page {
  kicker: string;
  title: string;
  accent: string;
  legend?: boolean;
  intro: string;
  nowLabel: string;
  now: PageNow;
  items: PageItem[];
  href?: string;
  linkLabel?: string;
  theme: PageTheme;
}

export interface CatalogItem {
  label: string;
  mode?: ModeKey;
  href?: string;
}

export interface Category {
  key: string;
  label: string;
  kind: string;
  num: string;
  summary: string;
  items: CatalogItem[];
}
