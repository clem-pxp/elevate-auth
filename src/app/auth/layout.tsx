import ElevateLogo from '@/components/Icons/Logos/ElevateLogo';
import { AuthCarousel } from '@/components/auth/AuthCarousel';
import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // md: grid-cols-2 (768px+), lg: grid-cols custom (1024px+)
    <div className="lg:grid w-full h-screen min-h-screen lg:grid-cols-2 xl:grid-cols-[0.45fr_0.55fr]">
      {/* Colonne de gauche */}
      <div className="p-5 h-full flex overflow-y-auto w-full scrollbar-hide">
        <div className="flex flex-col justify-start  items-center w-full md:px-8">
          <div className="flex flex-col md:gap-16 gap-8 items-strecth w-full max-w-[40rem] ">
            <ElevateLogo className="w-25 text-primary shrink-0" />
            <div className="flex">{children}</div>
          </div>
        </div>
      </div>

      {/* Colonne de droite */}
      <div className="p-5 pl-0 h-screen hidden lg:flex">
        <div className="flex flex-col items-end justify-end rounded-3xl px-11 py-6 overflow-hidden relative h-full">
          <img src="/images/background.jpg" alt="background" className="w-full h-full object-cover absolute inset-0 select-none pointer-events-none" />
          <div className="relative z-10">
            <AuthCarousel />
          </div>
        </div>
      </div>
    </div>
  );
}
