/** Brand tokens live in CSS variables (src/index.css); Tailwind only references them. */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: v('primary'), 600: v('primary-600'), 50: v('primary-50'), 100: v('primary-100') },
        charcoal: { DEFAULT: v('charcoal'), 600: v('charcoal-600'), 400: v('charcoal-400'), 200: v('charcoal-200'), 100: v('charcoal-100'), 50: v('charcoal-50') },
        dark: { DEFAULT: v('dark'), 600: v('dark-600'), 500: v('dark-500'), 400: v('dark-400') },
        surface: v('surface'), line: v('line'), muted: v('muted'), sky: v('sky'), teal: v('teal'), gold: v('gold'), rose: v('rose'),
        ink: { DEFAULT: v('ink') },
        success: { DEFAULT: v('success'), 50: v('success-50') },
        warning: { DEFAULT: v('warning'), 50: v('warning-50') },
        danger: { DEFAULT: v('danger'), 50: v('danger-50') },
      },
      opacity: { 12: '0.12', 15: '0.15' },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '12px', control: '8px' },
      boxShadow: {
        soft: '0 1px 2px rgb(var(--charcoal) / .05), 0 4px 16px rgb(var(--charcoal) / .06)',
        card: '0 2px 4px rgb(var(--charcoal) / .03), 0 12px 40px rgb(var(--charcoal) / .08)',
      },
      keyframes: {
        'reveal-s': { from: { clipPath: 'inset(0 100% 0 0)' }, to: { clipPath: 'inset(0 0 0 0)' } },
        'reveal-e': { from: { clipPath: 'inset(0 0 0 100%)' }, to: { clipPath: 'inset(0 0 0 0)' } },
        draw: { from: { strokeDashoffset: '1' }, to: { strokeDashoffset: '0' } },
        fill: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        sway: { '0%,100%': { transform: 'rotate(-1.5deg)' }, '50%': { transform: 'rotate(1.5deg)' } },
        'card-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        'slide-fwd': { from: { opacity: '0', transform: 'translateX(calc(var(--dir, 1) * 28px))' }, to: { opacity: '1', transform: 'none' } },
        'slide-back': { from: { opacity: '0', transform: 'translateX(calc(var(--dir, 1) * -28px))' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: {
        'reveal-s': 'reveal-s 700ms ease-out both',
        'reveal-e': 'reveal-e 700ms ease-out both',
        draw: 'draw 2600ms cubic-bezier(.22,.61,.36,1) both',
        fill: 'fill 6000ms linear forwards',
        'reveal-slow-s': 'reveal-s 2000ms cubic-bezier(.22,.61,.36,1) both',
        'reveal-slow-e': 'reveal-e 2000ms cubic-bezier(.22,.61,.36,1) both',
        float: 'float 6s ease-in-out infinite',
        sway: 'sway 12s ease-in-out infinite',
        'card-in': 'card-in 500ms ease-out both',
        'slide-fwd': 'slide-fwd 350ms ease-out both',
        'slide-back': 'slide-back 350ms ease-out both',
      },
    },
  },
  plugins: [],
};
