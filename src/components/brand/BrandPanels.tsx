import { useState } from 'react';
import { Logo } from '../ui/Logo';
import { HeroArt } from './HeroArt';
import photo1 from '../../assets/hero/slide-1.png';
import photo2 from '../../assets/hero/slide-2.png';
import photo3 from '../../assets/hero/slide-3.png';
import photo4 from '../../assets/hero/slide-4.png';
import photo5 from '../../assets/hero/slide-5.png';

const SLIDE_MS = 6000;
/**
 * Photo placement comes from the design canvas (1728 x 926): each cut-out is 1389 x 926 px, clipped to a band
 * (x, w) and shifted by `left`. Expressed as % of the stage so it scales with the viewport height.
 */
const W = 1728;
const SLIDES = [
  { title: 'Application tracking', text: 'Follow every customer application from submission to approval.', photo: photo1, x: 516, w: 697, left: -120 },
  { title: 'User controls', text: 'Block and unblock digital banking users in seconds.', photo: photo2, x: 191, w: 896, left: -302 },
  { title: 'Account controls', text: 'Freeze and release accounts with maker-checker approval.', photo: photo3, x: 484, w: 832, left: -49 },
  { title: 'Audit trail', text: 'Every action recorded, time-stamped and attributable.', photo: photo4, x: 491, w: 747, left: -117 },
  { title: 'Role-based access', text: 'IT, Marketing, Product and Back-office, provisioned from AD.', photo: photo5, x: 209, w: 871, left: -309 },
];

/** Full-bleed dark hero: arcs, per-slide photo, headline and segmented progress. Sits behind the sign-in card. */
export function HeroBanner() {
  const [i, setI] = useState(0);
  const next = () => setI((n) => (n + 1) % SLIDES.length);
  const s = SLIDES[i];
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {/* Stage keeps the design's 1728:926 proportions (fits the viewport height; on narrower screens it is shifted so the photo stays clear of the card). */}
      <div aria-hidden="true" className="absolute inset-y-0 aspect-[1728/926] h-full" style={{ insetInlineStart: 'min(0px, calc(100vw - 100vh * 1.8661))' }}>
        <HeroArt className="absolute inset-0 size-full" />
        {SLIDES.map((sl, n) => (
          <div key={sl.title} className={`absolute inset-y-0 hidden overflow-hidden transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none lg:block ${n === i ? 'opacity-[0.84]' : 'opacity-0'}`}
            style={{ insetInlineStart: `${(sl.x / W) * 100}%`, width: `${(sl.w / W) * 100}%` }}>
            <img src={sl.photo} alt="" draggable={false} decoding="async"
              className={`absolute top-0 h-full max-w-none transition-transform duration-[1600ms] ease-out motion-reduce:transition-none ${n === i ? 'translate-x-0' : 'translate-x-3'}`}
              style={{ width: `${(1389 / sl.w) * 100}%`, insetInlineStart: `${((sl.left - sl.x) / sl.w) * 100}%` }} />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-[27.75%] bg-gradient-to-t from-ink via-ink/50 to-transparent" />
      </div>

      <div className="absolute top-[35.3%] hidden lg:block" style={{ insetInlineStart: '11.6vw' }}>
        <h1 className="text-[44px] font-medium leading-[55px] tracking-[-0.012em] text-white">Every operation.<br />One secure console.</h1>
        <p className="mt-[15px] text-[15px] leading-[21px] text-white/70">Sign in with your NBF Active Directory account.</p>
        <div key={s.title} className="mt-[65px] motion-safe:animate-card-in" aria-live="polite">
          <p className="text-sm font-semibold leading-5 text-white">{s.title}</p>
          <p className="mt-1 text-sm leading-5 text-white/60">{s.text}</p>
        </div>
        <div className="mt-[38px] flex gap-2" role="group" aria-label="Feature highlights">
          {SLIDES.map((sl, n) => (
            <button key={sl.title} type="button" onClick={() => setI(n)} aria-label={sl.title} aria-current={n === i}
              className="relative h-4 w-10 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
                {n === i && <span key={i} onAnimationEnd={next} style={{ animationDuration: `${SLIDE_MS}ms` }}
                  className="absolute inset-0 origin-[left_center] bg-primary motion-safe:animate-fill motion-reduce:scale-x-100 rtl:origin-right" />}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BrandHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between pe-4 ps-1 pt-[21px] sm:pe-14 sm:ps-[45px]">
      <Logo variant="white" height={44} />
      <span className="rounded-full border border-white/25 px-[13px] py-[5px] text-[11px] font-medium uppercase leading-4 tracking-[0.14em] text-white/80">Back-office portal</span>
    </header>
  );
}
