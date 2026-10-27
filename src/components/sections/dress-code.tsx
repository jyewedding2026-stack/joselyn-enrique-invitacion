import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";

export function DressCodeSection() {
  return (
    <section id="dress-code" className="invite-panel section-shell bg-[var(--warm-white)]">
      <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
        <FadeIn>
          <p className="section-eyebrow">Código de vestimenta</p>
          <h2 className="section-title">{wedding.dressCode.label}</h2>
          <div className="mx-auto mt-8 w-full max-w-[16.5rem] sm:max-w-[19rem]">
            {/* Relative path for Arweave / path-hosted static export */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={wedding.dressCode.illustration}
              alt="Código de vestimenta elegante"
              width={896}
              height={1200}
              className="h-auto w-full select-none"
              loading="lazy"
              decoding="async"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="mx-auto mt-8 max-w-xl space-y-3">
            {wedding.dressCode.lines.map((line) => (
              <p key={line.lead} className="section-lead">
                <span className="font-medium text-[var(--olive-deep)]">
                  {line.lead}
                </span>
                {": "}
                {line.text}
              </p>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
