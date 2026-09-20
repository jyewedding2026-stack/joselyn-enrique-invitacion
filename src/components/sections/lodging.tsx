import { ExternalLink } from "lucide-react";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";

export function LodgingSection() {
  return (
    <section id="hospedaje" className="section-shell bg-[var(--sand)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">Para quienes viajan</p>
          <h2 className="section-title">Hospedaje</h2>
          <p className="section-lead mt-4 max-w-2xl">
            Sugerencias cercanas a la ceremonia y la recepción. Edita estos
            datos en <code className="text-sm">wedding.ts</code>.
          </p>
        </FadeIn>

        <ul className="mt-10 space-y-6">
          {wedding.lodging.map((hotel, i) => (
            <FadeIn key={hotel.name} delay={0.05 * i}>
              <li className="border-b border-[var(--sand-border)] pb-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--olive-deep)]">
                    {hotel.name}
                  </h3>
                  <span className="text-sm text-[var(--olive)]">{hotel.zone}</span>
                </div>
                <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
                  {hotel.note}
                </p>
                <a
                  href={hotel.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--olive-deep)] underline-offset-4 hover:underline"
                >
                  Ver en Maps
                  <ExternalLink className="size-3.5" />
                </a>
              </li>
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}
