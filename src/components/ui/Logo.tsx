import colorLogo from '../../assets/nbf-logo-color.png';
import whiteLogo from '../../assets/nbf-logo-white.png';

/** variant="color" → light backgrounds only; "white" → dark/blue backgrounds only. Clear space = 0.25 × height. */
export function Logo({ variant = 'color', height = 48 }: { variant?: 'color' | 'white'; height?: number }) {
  return (
    <span className="inline-block" style={{ padding: height * 0.25 }}>
      <img src={variant === 'color' ? colorLogo : whiteLogo} alt="National Bank of Fujairah" style={{ height, width: 'auto' }} />
    </span>
  );
}
