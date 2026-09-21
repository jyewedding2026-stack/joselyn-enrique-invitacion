import Image from "next/image";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";

export function StorySection() {
  return (
    <section id="historia" className="invite-panel section-shell bg-[var(--warm-white)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">Bienvenidos</p>
          <h2 className="section-title">{wedding.story.welcomeTitle}</h2>
          <p className="section-lead mt-4 max-w-2xl">{wedding.story.welcome}</p>
        </FadeIn>

        <div className="mt-12 space-y-14 md:mt-16">
          {wedding.story.chapters.map((chapter, index) => (
            <FadeIn
              key={chapter.title}
              delay={0.05 * index}
              className={`grid items-center gap-8 md:grid-cols-2 ${
                index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={chapter.image}
                  alt={chapter.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-3xl text-[var(--olive-deep)] md:text-4xl">
                  {chapter.title}
                </h3>
                <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">
                  {chapter.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
