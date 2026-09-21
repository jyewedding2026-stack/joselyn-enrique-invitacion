"use client";

import { wedding } from "@/content/wedding";
import { HeroMotion } from "@/components/motion";
import { Countdown } from "@/components/countdown";

export function HeroSection() {
  return (
    <section id="inicio" className="relative z-0 h-[155svh] w-full md:h-[165svh]">
      <div className="sticky top-0 flex h-[100svh] items-end">
        <div
          className="absolute inset-0 overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(40,48,28,0.35) 0%, rgba(40,48,28,0.15) 40%, rgba(40,48,28,0.72) 100%), url(${wedding.hero.image})`,
          }}
          role="img"
          aria-label={wedding.hero.imageAlt}
        />
        <div className="hero-grain absolute inset-0" aria-hidden />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-24 sm:pb-16 md:px-8 md:pb-24 md:pt-32">
          <HeroMotion>
            <p className="mb-2 text-xs tracking-[0.28em] text-white/85 uppercase sm:mb-3 sm:text-sm">
              {wedding.date.shortDisplay}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-[2.75rem] leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl">
              {wedding.couple.displayName}
            </h1>
            <p className="mt-3 max-w-md text-sm text-white/90 sm:mt-5 sm:text-base md:text-lg">
              {wedding.couple.shortLine}
            </p>
            <Countdown />
            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
              <a
                href="#rsvp"
                className="inline-flex h-10 items-center rounded-md bg-[var(--olive)] px-4 text-sm font-medium text-[var(--warm-white)] hover:bg-[var(--olive-deep)] sm:h-11 sm:px-5 sm:text-base"
              >
                Confirmar asistencia
              </a>
              <a
                href="#logistica"
                className="inline-flex h-10 items-center rounded-md border border-white/50 bg-transparent px-4 text-sm font-medium text-white hover:bg-white/15 sm:h-11 sm:px-5 sm:text-base"
              >
                Ver detalles
              </a>
            </div>
          </HeroMotion>
        </div>
      </div>
    </section>
  );
}
