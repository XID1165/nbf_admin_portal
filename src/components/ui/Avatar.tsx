import { Building2, Cog, Users, UserRound } from 'lucide-react';

/**
 * Illustrated avatars for people shown across the portal.
 * Deterministic from the name, so the same person always looks the same on every screen.
 * Companies, the System actor and AD groups get an icon avatar instead of a face.
 * The skin / hair / headwear colours below are illustration art, not brand colours.
 */
const SKIN = ['#F1C9A5', '#E0AC85', '#C68B63', '#9C6A48'];
const HAIR = ['#2B211C', '#3A2A20', '#1D1A1A', '#54382A'];
const WHITE = '#FBFBFA';

const FEMALE = new Set(['noura', 'mariam', 'layla', 'fatima', 'hessa', 'priya', 'sara', 'aisha', 'maryam', 'latifa', 'shamma', 'reem']);
const NON_ARAB = new Set(['priya', 'daniel']);
const ORG = /\b(llc|ltd|trading|logistics|holdings?|group|enterprises?|co|pjsc|bank)\b/i;

const BG = ['bg-primary/15', 'bg-sky/60', 'bg-gold/20', 'bg-teal/15', 'bg-rose/15', 'bg-dark/10'] as const;
const CLOTH = ['fill-dark', 'fill-primary', 'fill-teal', 'fill-charcoal', 'fill-gold', 'fill-rose'] as const;

const hash = (s: string) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

export type AvatarKind = 'person' | 'org' | 'system' | 'group' | 'unassigned';
export function avatarKind(name: string): AvatarKind {
  if (/^(system|it admin)$/i.test(name)) return 'system';
  if (ORG.test(name) || /\b(logistics|trading)\b/i.test(name)) return 'org';
  return 'person';
}

const SIZE = { xs: 'size-6', sm: 'size-[26px]', md: 'size-8', lg: 'size-9', xl: 'size-10' } as const;
export type AvatarSize = keyof typeof SIZE;

interface AvatarProps { name?: string | null; kind?: AvatarKind; size?: AvatarSize; className?: string }

function Face({ name }: { name: string }) {
  const h = hash(name);
  const first = name.trim().split(/\s+/)[0].toLowerCase();
  const female = FEMALE.has(first);
  const arab = !NON_ARAB.has(first);
  const skin = SKIN[h % SKIN.length], hair = HAIR[(h >> 3) % HAIR.length];
  const cloth = CLOTH[(h >> 5) % CLOTH.length];
  const head = <ellipse cx="20" cy="18" rx="5.6" ry="6.6" fill={skin} />;
  const neck = <rect x="17.6" y="22" width="4.8" height="8" rx="2" fill={skin} />;
  const shoulders = (fill: string | undefined, cls?: string) => <path d="M5 41c0-9.5 7.5-12.5 15-12.5S35 31.5 35 41z" fill={fill} className={cls} />;

  if (female && arab) {
    // headscarf
    return (<>
      {shoulders(undefined, cloth)}
      {neck}
      <path d="M20 6.5c-7.4 0-9.4 5.6-9.4 10.6 0 6.6 2.6 9.2 1.6 14.2L20 34l7.8-2.7c-1-5 1.6-7.6 1.6-14.2C29.4 12.1 27.4 6.5 20 6.5z" fill={WHITE} opacity=".96" />
      <ellipse cx="20" cy="18.2" rx="5.2" ry="6.2" fill={skin} />
      <path d="M14.4 15.6c1.2-3.6 4.4-4.8 5.6-4.8s4.4 1.2 5.6 4.8c-2.2-1.6-4-2.1-5.6-2.1s-3.4.5-5.6 2.1z" fill={WHITE} />
    </>);
  }
  if (female) {
    // long hair
    return (<>
      {shoulders(undefined, cloth)}
      <path d="M12 17.5c-1.4-9.5 4.6-12 8-12s9.4 2.5 8 12l1.2 12.5H10.8z" fill={hair} />
      {neck}{head}
      <path d="M14.2 16.2c1-4.4 4.4-6 6.4-6 3.4 0 5.4 2.6 5.8 6-2.2-1.6-4.2-3.2-7-3.2-2 0-3.8.6-5.2 3.2z" fill={hair} />
    </>);
  }
  if (arab) {
    // ghutra + agal, kandura
    return (<>
      {shoulders(WHITE)}
      {neck}
      <path d="M20 6.5c-6.4 0-8.4 4.8-8.4 9.6v8.2c0 1.6 1 2.4 2.4 2.4h12c1.4 0 2.4-.8 2.4-2.4v-8.2c0-4.8-2-9.6-8.4-9.6z" fill={WHITE} stroke="#00000014" strokeWidth=".6" />
      <ellipse cx="20" cy="18.6" rx="5.2" ry="6" fill={skin} />
      <path d="M12 12.2c2.4-2.4 5.2-3 8-3s5.6.6 8 3" fill="none" stroke={hair} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.6 20.6c1 2.6 2 3.6 3.4 3.6s2.4-1 3.4-3.6c-1 .8-2.2 1.2-3.4 1.2s-2.4-.4-3.4-1.2z" fill={hair} opacity=".85" />
    </>);
  }
  // short hair, shirt + collar
  return (<>
    {shoulders(undefined, cloth)}
    <path d="M16.4 28.6 20 33l3.6-4.4" fill="none" stroke={WHITE} strokeWidth="1.6" strokeLinejoin="round" />
    {neck}{head}
    <path d="M14 16.4c-.4-5.6 3.2-8.2 6.2-8.2s6.6 2.6 5.8 8.2c-.8-2.6-2.4-3.8-5.8-3.8s-4.8 1.2-6.2 3.8z" fill={hair} />
  </>);
}

/** Round avatar. `name` drives the illustration; `kind` forces an icon variant. Decorative: the name is always rendered beside it. */
export function Avatar({ name, kind, size = 'md', className = '' }: AvatarProps) {
  const k: AvatarKind = kind ?? (name ? avatarKind(name) : 'unassigned');
  const box = `relative inline-flex ${SIZE[size]} shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-inset ring-charcoal/10 ${className}`;

  if (k === 'person' && name) {
    return (
      <span aria-hidden="true" className={`${box} ${BG[hash(name) % BG.length]}`}>
        <svg viewBox="0 0 40 40" className="size-full"><Face name={name} /></svg>
      </span>
    );
  }
  const Icon = k === 'org' ? Building2 : k === 'system' ? Cog : k === 'group' ? Users : UserRound;
  const tone = k === 'org' ? 'bg-sky/50 text-dark' : k === 'system' ? 'bg-dark text-white' : k === 'group' ? 'bg-primary/10 text-primary-600' : 'bg-transparent text-muted ring-dashed';
  return (
    <span aria-hidden="true" className={`${box} ${tone} ${k === 'unassigned' ? 'border border-dashed border-charcoal/30 ring-0' : ''}`}>
      <Icon className="size-[55%]" strokeWidth={1.75} />
    </span>
  );
}
