'use client';

import { useEffect, useState } from 'react';

interface AppDownloadBadgesProps {
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export function AppDownloadBadges({ variant = 'horizontal', className = '' }: AppDownloadBadgesProps) {
  const [detectedPlatform, setDetectedPlatform] = useState<'ios' | 'android' | 'other'>('other');

  const iosUrl = 'http://ios.elevateapp.fr/4ABL';
  const androidUrl = 'http://android.elevateapp.fr/4ABL';

  // Détecter la plateforme
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      setDetectedPlatform('ios');
    } else if (/android/i.test(userAgent)) {
      setDetectedPlatform('android');
    } else {
      setDetectedPlatform('other');
    }
  }, []);

  const containerClass = variant === 'vertical' 
    ? 'flex flex-col gap-3' 
    : 'flex flex-col sm:flex-row gap-3 items-center justify-center';

  return (
    <div className={`${containerClass} ${className}`}>
      {/* App Store Badge */}
      <a href={iosUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block hover:opacity-80 transition-opacity"
      >
        <img
          src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/fr-fr?size=250x83"
          alt="Télécharger sur l'App Store"
          className="h-[50px] w-auto"
        />
      </a>

      {/* Google Play Badge */}
      <a href={androidUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block hover:opacity-80 transition-opacity"
      >
        <img
          src="https://play.google.com/intl/fr_fr/badges/static/images/badges/fr_badge_web_generic.png"
          alt="Disponible sur Google Play"
          className="h-[50px] w-auto"
        />
      </a>
    </div>
  );
}