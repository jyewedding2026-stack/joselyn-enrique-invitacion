import { ArrowUpRight, Map, MapPin } from "lucide-react";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";

export function LodgingSection() {
  return (
    <section id="hospedaje" className="relative z-10 section-shell bg-[var(--sand)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">Para quienes viajan</p>
          <h2 className="section-title">Hospedaje</h2>
        </FadeIn>

        <ul className="mt-8 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
          {wedding.lodging.map((hotel, i) => (
            <FadeIn key={hotel.name} delay={0.05 * i} className="h-full">
              <li className="flex h-full flex-col rounded-3xl border border-[var(--sand-border)] bg-[var(--card)] p-4 shadow-none sm:p-5">
                <h3 className="font-[family-name:var(--font-display)] text-[1.65rem] leading-tight text-[var(--olive-deep)]">
                  {hotel.name}
                </h3>
                <p className="mt-2 flex items-start gap-1.5 text-sm leading-snug text-[var(--olive)]">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>{hotel.location}</span>
                </p>
                <div className="mt-4 grid w-full grid-cols-2 gap-2">
                  <a
                    href={hotel.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-[var(--olive-deep)] px-2 text-sm font-medium whitespace-nowrap text-[var(--olive-deep)] transition-colors hover:bg-[var(--olive-deep)]/10"
                  >
                    <Map className="size-3.5 shrink-0" aria-hidden="true" />
                    Ver mapa
                  </a>
                  <a
                    href={hotel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-[var(--olive-deep)] px-2 text-sm font-medium whitespace-nowrap text-[var(--warm-white)] transition-colors hover:bg-[#323a28]"
                  >
                    Página web
                    <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              </li>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}
