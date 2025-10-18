'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';

const slides = [
  {
    quote:
      "Cette application a transformé ma façon de travailler. L'interface est intuitive et le support est incroyablement réactif.",
    author: 'Alexandre Dupont',
    role: 'CEO, Innovatech',
    imageUrl: 'https://placehold.co/64x64/E9D5FF/4C1D95?text=AD',
  },
  {
    quote:
      '"Un gain de temps phénoménal au quotidien. Je ne pourrais plus m\'en passer. Un outil indispensable pour toute mon équipe."',
    author: 'Marie Leroy',
    role: 'Chef de projet, Solutions Créatives',
    imageUrl: 'https://placehold.co/64x64/FBCFE8/86198F?text=ML',
  },
  {
    quote:
      '"Enfin une solution qui comprend vraiment nos besoins. La flexibilité et la puissance sont au rendez-vous. Bravo !"',
    author: 'Julien Petit',
    role: 'Développeur Freelance',
    imageUrl: 'https://placehold.co/64x64/BAE6FD/0C4A6E?text=JP',
  },
];

export function AuthCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'center', // ⬅️ Aligne les slides au début
      containScroll: 'trimSnaps', // ⬅️ Évite les espaces vides
    }, 
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = (emblaApi: EmblaCarouselType) => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative w-full">
      <div className="embla overflow-hidden" ref={emblaRef}>
        <div className="embla__container flex gap-4"> {/* ⬅️ gap entre slides */}
          {slides.map((slide, index) => (
            <div 
              className="embla__slide min-w-0 flex-[0_0_66%]" // ⬅️ 66% = 1.5 slides visibles
              key={index}
            >
              <div className="flex h-full flex-col justify-between gap-6 rounded-[2.125rem] border border-white/20 bg-white/10 p-7 text-white shadow-[inset_0_0_15px_rgba(255,255,255,0.15)] backdrop-blur-lg">
                {/* Texte de la review avec la bonne taille de police */}
                <blockquote className="text-base font-medium">
                  {slide.quote}
                </blockquote>
                
                {/* Section inférieure avec photo et nom */}
                <div className="flex items-center justify-start gap-3">
                  <div className="flex h-[2.625rem] w-[2.625rem] overflow-hidden rounded-full">
                    <img
                      src={slide.imageUrl}
                      alt={`Photo de ${slide.author}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1 leading-tight">
                    <cite className="block font-semibold not-italic">
                      {slide.author}
                    </cite>
                    <cite className="text-sm text-gray-300 not-italic">
                      Membre Elevate
                    </cite>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination (les "bullets") */}
      <div className="embla__dots mt-6 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === selectedIndex 
                ? 'bg-white w-6' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Aller au témoignage ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}