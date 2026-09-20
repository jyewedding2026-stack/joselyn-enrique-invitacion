import Image from "next/image";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";

export function DressCodeSection() {
  return (
    <section id="dress-code" className="section-shell bg-[var(--warm-white)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">Código de vestimenta</p>
          <h2 className="section-title">{wedding.dressCode.label}</h2>
          <p className="section-lead mt-4 max-w-2xl">
            {wedding.dressCode.description}
          </p>
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {wedding.dressCode.inspirationImages.map((img, i) => (
            <FadeIn key={img.src} delay={0.06 * i}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
