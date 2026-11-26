import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> { label: string; icon?: ReactNode; trailing?: ReactNode; error?: string; hint?: ReactNode; labelAction?: ReactNode; }
export function Input({ label, labelAction, icon, trailing, error, hint, className = '', ...rest }: Props) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between"><label htmlFor={id} className="text-sm font-medium text-charcoal">{label}</label>{labelAction}</div>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-[18px] text-charcoal/70">{icon}</span>}
        <input id={id} aria-invalid={!!error} aria-describedby={error || hint ? msgId : undefined} {...rest}
          className={`h-12 w-full rounded-control border bg-white text-sm text-charcoal placeholder:text-charcoal/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 ${icon ? 'ps-[47px]' : 'ps-3'} ${trailing ? 'pe-11' : 'pe-3'} ${error ? 'border-danger' : 'border-charcoal/12'} ${className}`} />
        {trailing && <span className="absolute inset-y-0 end-0 flex items-center pe-[11px]">{trailing}</span>}
      </div>
      {(error || hint) && <p id={msgId} className={`mt-1.5 text-xs ${error ? 'text-danger' : 'text-warning'}`}>{error ?? hint}</p>}
    </div>
  );
}
