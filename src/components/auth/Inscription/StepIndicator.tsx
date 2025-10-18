'use client';

import { motion } from "motion/react";
import { useRef, useEffect } from 'react';
import { useInscriptionStore } from '@/app/auth/inscription/useInscriptionStore';
import FormIcon from '@/components/Icons/FormICon';
import TagIcon from '@/components/Icons/TagIcon';
import CreditCardIcon from '@/components/Icons/CreditCardIcon';
import CheckIcon from '@/components/Icons/CheckIcon';
import PartyIcon from '@/components/Icons/Party';

const steps = [
  { number: 1, label: 'Informations', icon: FormIcon },
  { number: 2, label: 'Plan', icon: TagIcon },
  { number: 3, label: 'Paiement', icon: CreditCardIcon },
  { number: 4, label: 'Confirmation', icon: PartyIcon },
];

export function StepIndicator() {
  const { currentStep, maxStepReached, setCurrentStep } = useInscriptionStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Auto-scroll vers le step actif
  useEffect(() => {
    const activeIndex = currentStep - 1;
    const button = buttonRefs.current[activeIndex];
    const container = scrollContainerRef.current;

    if (button && container) {
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const containerWidth = container.offsetWidth;

      // Centrer le bouton dans le conteneur
      const targetScroll = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [currentStep]);

  return (
    <div className="w-full">
      <div className="bg-app rounded-[0.875rem] border-[0.5px] border-border-soft relative">
        <div className="overflow-x-auto scrollbar-hide p-1" ref={scrollContainerRef}>
          <div className="flex md:gap-1 gap-0 min-w-max lg:min-w-full">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isAccessible = step.number <= maxStepReached;

              return (
                <button
                  key={step.number}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  onClick={() => isAccessible && setCurrentStep(step.number)}
                  disabled={!isAccessible}
                  className={`
                    relative lg:flex-1 flex-shrink-0 lg:px-4 md:px-3 px-2 py-2 rounded-[0.625rem] transition-opacity cursor-pointer md:text-base text-sm
                    ${isActive ? 'opacity-100 text-white' : 'opacity-50'}
                    ${!isAccessible && 'cursor-not-allowed'}
                  `}
                  style={{ minWidth: '7.25rem' }}
                >
                  {/* Background animé */}
                  {isActive && (
                    <motion.div
                      layoutId="activeStep"
                      className="absolute inset-0 bg-brand rounded-[0.625rem] shadow-card pointer-events-none"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Contenu */}
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <Icon className="md:size-4 size-3.5 shrink-0" />
                    <span className="font-medium text-sm whitespace-nowrap">{step.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}