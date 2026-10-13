"use client";

import { Church, Wine } from "lucide-react";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";

const scriptStyle = { fontFamily: '"Great Vibes", cursive' } as const;
const serifFont = "font-[family-name:var(--font-display)]";

export function LogisticsSection() {
  return (
    <section id="logistica" className="relative z-10 section-shell bg-[var(--sand)]">
      <div className="mx-auto max-w-xl px-5 md:px-8">
        <FadeIn>
          <header className="text-center">
            <p className="text-[0.72rem] tracking-[0.34em] text-[var(--olive)] uppercase">
              CUÁNDO & DÓNDE
            </p>
            <h2 className="mt-7 flex flex-col items-center md:mt-8">
              <span
                className={`${serifFont} text-[clamp(2.75rem,7vw,4.25rem)] leading-[0.95] font-medium text-[var(--olive-deep)]`}
              >
                El gran
              </span>
              <span
                style={scriptStyle}
                className="mt-1 py-1 text-[clamp(4.5rem,13vw,6.75rem)] leading-[1.05] font-normal text-[#a0894a]"
              >
                día
              </span>
            </h2>
          </header>
        </FadeIn>

        <div className="mt-16 flex flex-col items-stretch gap-8 md:mt-24 md:gap-10">
          <FadeIn>
            <article className="rounded-3xl border border-[#d8c7a8] bg-[var(--warm-white)] px-6 py-12 text-center shadow-none sm:px-10 sm:py-14 md:px-14 md:py-16">
              <Church
                className="mx-auto size-7 text-[var(--olive)]"
                strokeWidth={1.25}
                aria-hidden
              />
              <h3
                className={`${serifFont} mt-5 text-[clamp(2.25rem,5vw,3.25rem)] leading-none text-[var(--olive-deep)]`}
              >
                Ceremonia
              </h3>
              <p
                className={`${serifFont} mt-5 text-xl tracking-[0.16em] text-[var(--olive-deep)] md:text-2xl`}
              >
                {wedding.ceremony.time}
              </p>
              <p
                className={`${serifFont} mt-7 text-[clamp(1.45rem,3.5vw,1.85rem)] leading-snug text-[var(--ink)]`}
              >
                {wedding.ceremony.place}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)] md:text-base">
                {wedding.ceremony.address}
              </p>
              <a
                href={wedding.ceremony.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-[#c9a227]/40 px-7 text-[0.72rem] font-medium tracking-[0.22em] text-[var(--olive-deep)] transition-colors hover:border-[var(--olive)]/45 hover:bg-[var(--sand)]"
              >
                CÓMO LLEGAR
              </a>
            </article>
          </FadeIn>

          <FadeIn delay={0.08}>
            <article className="rounded-3xl border border-[#d8c7a8] bg-[var(--warm-white)] px-6 py-12 text-center shadow-none sm:px-10 sm:py-14 md:px-14 md:py-16">
              <Wine
                className="mx-auto size-7 text-[var(--olive)]"
                strokeWidth={1.25}
                aria-hidden
              />
              <h3
                className={`${serifFont} mt-5 text-[clamp(2.25rem,5vw,3.25rem)] leading-none text-[var(--olive-deep)]`}
              >
                Recepción
              </h3>
              <p
                className={`${serifFont} my-8 text-xl tracking-[0.16em] text-[var(--olive-deep)] md:my-10 md:text-2xl`}
              >
                {wedding.reception.time}
              </p>
              <p
                className={`${serifFont} text-[clamp(1.45rem,3.5vw,1.85rem)] leading-snug text-[var(--ink)]`}
              >
                {wedding.reception.place}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink-soft)] md:text-base">
                {wedding.reception.address}
              </p>
              <a
                href={wedding.reception.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-[#c9a227]/40 px-7 text-[0.72rem] font-medium tracking-[0.22em] text-[var(--olive-deep)] transition-colors hover:border-[var(--olive)]/45 hover:bg-[var(--sand)]"
              >
                CÓMO LLEGAR
              </a>
              <p
                style={scriptStyle}
                className="mt-10 text-[clamp(1.55rem,4vw,2rem)] leading-snug text-[var(--olive-muted)]"
              >
                Los esperamos para celebrar toda la noche.
              </p>
            </article>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
