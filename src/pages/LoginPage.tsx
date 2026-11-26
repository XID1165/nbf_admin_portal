import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeroBanner, BrandHeader } from '../components/brand/BrandPanels';
import { CardSails } from '../components/brand/CardSails';
import { CredentialsForm } from '../components/auth/CredentialsForm';
import { MfaForm } from '../components/auth/MfaForm';
import { DemoNote } from '../components/auth/DemoNote';
import type { Challenge } from '../services/types';

type Motion = 'initial' | 'fwd' | 'back';

export default function LoginPage() {
  const { session } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [motion, setMotion] = useState<Motion>('initial');
  if (session) return <Navigate to="/dashboard" replace />;

  const slide = motion === 'fwd' ? 'motion-safe:animate-slide-fwd' : motion === 'back' ? 'motion-safe:animate-slide-back' : '';
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <HeroBanner />
      <BrandHeader />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 pb-20 pt-24 sm:px-8 lg:items-start lg:justify-end lg:pt-[108px] lg:pe-[11.6vw]">
        <div className="motion-safe:animate-card-in relative w-full max-w-[448px]" style={{ animationDelay: '300ms' }}>
          <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-[0_24px_48px_-16px_rgb(var(--dark)/0.18),0_1px_2px_rgb(var(--dark)/0.06)] sm:p-10">
            <CardSails className="pointer-events-none absolute end-0 -top-12 h-[150px] w-[88px] text-primary rtl:-scale-x-100" />
            <div key={challenge ? 'mfa' : 'creds'} className={`relative ${slide}`}>
              {challenge
                ? <MfaForm challenge={challenge} onBack={() => { setMotion('back'); setChallenge(null); }} />
                : <CredentialsForm onChallenge={(c) => { setMotion('fwd'); setChallenge(c); }} />}
            </div>
          </div>
        </div>
      </main>
      <DemoNote />
      <footer className="absolute inset-x-0 bottom-[33px] z-10 flex flex-wrap justify-center gap-x-6 gap-y-1 px-4 text-xs text-white/60">
        <span>&copy; 2026 National Bank of Fujairah PJSC</span>
        <a href="mailto:servicedesk@nbf.ae" className="underline-offset-2 hover:text-white hover:underline">IT Service Desk</a>
        <a href="#" className="underline-offset-2 hover:text-white hover:underline">Acceptable Use Policy</a>
      </footer>
    </div>
  );
}
