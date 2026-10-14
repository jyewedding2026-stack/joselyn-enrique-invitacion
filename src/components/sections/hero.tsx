"use client";

import { wedding } from "@/content/wedding";
import { HeroMotion } from "@/components/motion";
import { Countdown } from "@/components/countdown";

const phraseParts = wedding.couple.shortLine
  .split("♡")
  .map((part) => part.trim())
  .filter(Boolean);

function CalligraphicAmpersand() {
  return (
    <svg
      viewBox="50 27 733 619"
      aria-hidden="true"
      className="mx-[0.04em] inline-block h-[0.9em] w-auto shrink-0 align-baseline text-white"
      fill="none"
    >
      <g
        stroke="currentColor"
        strokeWidth="42"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M408 160C438 176 472 166 494 142C514 118 508 88 478 66C446 46 400 46 362 64C322 84 292 118 278 156C268 190 278 220 300 242C250 262 190 285 145 340C105 395 72 455 74 515C76 565 115 605 175 618C245 632 330 610 395 555C445 512 472 455 468 400C464 355 420 345 360 358C300 372 245 400 210 445C185 480 195 520 240 525C285 530 325 500 318 465" />
        <path d="M248 236C330 286 470 348 620 392C690 412 742 400 756 364C770 328 742 300 704 312" />
      </g>
    </svg>
  );
}

function FilledHeart() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[0.78em] w-[0.78em] shrink-0 text-white"
      fill="currentColor"
    >
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );
}

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
        <div className="hero-grain absolute inset-0 hidden md:block" aria-hidden />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-24 sm:pb-16 md:px-8 md:pb-24 md:pt-32">
          <HeroMotion>
            <p className="mb-2 text-xs tracking-[0.28em] text-white/85 uppercase sm:mb-3 sm:text-sm">
              {wedding.date.shortDisplay}
            </p>
            <h1
              className="max-w-full text-balance text-white"
              style={{
                fontFamily: '"Great Vibes", cursive',
                fontSize: "clamp(3.25rem, 12vw, 8rem)",
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              <span className="inline-block">{wedding.couple.bride}</span>
              <span className="sr-only">{" & "}</span>
              <CalligraphicAmpersand />
              <span className="inline-block">{wedding.couple.groom}</span>
            </h1>
            <p
              style={{ fontFamily: "var(--font-display)" }}
              className="mt-2 flex max-w-full flex-wrap items-center gap-x-[0.55em] gap-y-1.5 text-[0.72rem] leading-snug font-medium tracking-[0.18em] text-white uppercase sm:mt-3 sm:text-[0.8125rem] sm:tracking-[0.22em] md:text-sm"
            >
              {phraseParts.map((part, index) => (
                <span key={part} className="inline-flex items-center gap-[0.55em]">
                  {index > 0 ? <FilledHeart /> : null}
                  <span>{part}</span>
                </span>
              ))}
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
