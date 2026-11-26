import type { CSSProperties } from 'react';

export interface SailsProps { slow?: boolean; size?: number | string; opacity?: number; animate?: boolean; className?: string; delayMs?: number; }
const STEP = 120; // ms between ribbons (x2.5 when slow)
const REVEAL = {
  'reveal-s': ['motion-safe:animate-reveal-s', 'motion-safe:animate-reveal-slow-s'],
  'reveal-e': ['motion-safe:animate-reveal-e', 'motion-safe:animate-reveal-slow-e'],
} as const; // static strings so Tailwind keeps them

interface Base extends SailsProps { viewBox: string; paths: string[]; reveal: 'reveal-s' | 'reveal-e'; origin: string; }
function Sails({ size = 360, opacity = 1, animate = true, slow = false, className = '', delayMs = 0, viewBox, paths, reveal, origin }: Base) {
  const [, , w, h] = viewBox.split(' ').map(Number);
  return (
    <svg aria-hidden="true" focusable="false" viewBox={viewBox} width={size} height={typeof size === 'number' ? (size * h) / w : undefined}
      style={{ opacity, ...(typeof size === 'string' ? { aspectRatio: `${w}/${h}` } : {}) }}
      className={`${origin} ${animate ? 'motion-safe:animate-sway' : ''} ${className}`}>
      {paths.map((d, i) => {
        const style: CSSProperties | undefined = animate ? { animationDelay: `${delayMs + i * STEP * (slow ? 2.5 : 1)}ms` } : undefined;
        return <path key={i} d={d} fill="currentColor" style={style} className={animate ? REVEAL[reveal][slow ? 1 : 0] : ''} />;
      })}
    </svg>
  );
}

/** The logo's blue ribbon group (three tapered crescents, flat edge at the start side). Uses text colour: blue. */
export function SailsBlue(props: SailsProps) {
  return (
    <Sails {...props} viewBox="0 0 390 490" reveal="reveal-s" origin="origin-top-left text-primary"
      paths={[
        'M0 20C60 260 150 322 250 320C300 318 350 295 383 268C330 330 260 355 200 354C100 352 20 290 0 232Z',
        'M0 265C40 335 130 375 210 372C250 370 290 358 318 337C270 385 210 410 140 412C60 412 10 380 0 342Z',
        'M0 362C10 405 70 435 130 432C170 430 215 420 250 397C210 440 140 478 70 482C30 483 5 470 0 460Z',
      ]} />
  );
}

/** The logo's charcoal ribbon group (three crescents with a straight end edge and long tail). Uses text colour: charcoal. */
export function SailsCharcoal(props: SailsProps) {
  return (
    <Sails delayMs={props.slow ? 900 : 360} {...props} viewBox="150 0 400 465" reveal="reveal-e" origin="origin-bottom-right text-charcoal"
      paths={[
        'M295 85C360 30 430 0 490 2C520 3 540 10 545 20L545 115C535 65 500 45 440 46C390 46 335 60 295 85Z',
        'M228 145C280 95 340 70 410 70C490 70 535 100 545 138L545 215C535 160 480 108 380 107C320 107 268 120 228 145Z',
        'M162 212C210 155 275 127 345 127C440 127 530 190 545 250L545 460C520 320 440 165 330 158C270 154 210 170 162 212Z',
      ]} />
  );
}
