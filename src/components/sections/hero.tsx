"use client";

import { wedding } from "@/content/wedding";
import { HeroMotion } from "@/components/motion";
import { Countdown } from "@/components/countdown";

export function HeroSection() {
  return (
    <section id="inicio" className="relative z-0 h-[100svh] w-full">
      <div className="sticky top-0 flex h-[100svh] items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(40,48,28,0.35) 0%, rgba(40,48,28,0.15) 40%, rgba(40,48,28,0.72) 100%), url(${wedding.hero.image})`,
          }}
          role="img"
          aria-label={wedding.hero.imageAlt}
        />
        <div className="hero-grain absolute inset-0" aria-hidden />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-32 md:px-8 md:pb-24">
          <HeroMotion>
            <p className="mb-3 text-sm tracking-[0.28em] text-white/85 uppercase">
              {wedding.date.shortDisplay}
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-white sm:text-6xl md:text-7xl lg:text-8xl">
              {wedding.couple.displayName}
            </h1>
            <p className="mt-5 max-w-md text-base text-white/90 md:text-lg">
              {wedding.couple.shortLine}
            </p>
            <Countdown />
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#rsvp"
                className="inline-flex h-11 items-center rounded-md bg-[var(--olive)] px-5 text-base font-medium text-[var(--warm-white)] hover:bg-[var(--olive-deep)]"
              >
                Confirmar asistencia
              </a>
              <a
                href="#logistica"
                className="inline-flex h-11 items-center rounded-md border border-white/50 bg-transparent px-5 text-base font-medium text-white hover:bg-white/15"
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
