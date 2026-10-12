import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";

function StoryPhoto({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="mx-auto w-full max-w-lg">
      {/* Relative path for Arweave / path-hosted static export */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full rounded-xl"
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
}

export function StorySection() {
  const { welcomeTitle, openingImage, closingImage, chapters } = wedding.story;

  return (
    <section id="historia" className="invite-panel section-shell bg-[var(--warm-white)]">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">Bienvenidos</p>
          <h2 className="section-title">{welcomeTitle}</h2>
          <div className="mt-8">
            <StoryPhoto
              src={openingImage.src}
              alt={openingImage.alt}
              width={720}
              height={828}
            />
          </div>
        </FadeIn>

        <div className="mx-auto mt-12 max-w-2xl space-y-12 md:mt-16">
          {chapters.map((chapter, index) => (
            <FadeIn key={chapter.title} delay={0.05 * index}>
              <h3 className="font-[family-name:var(--font-display)] text-3xl text-[var(--olive-deep)] md:text-4xl">
                {chapter.title}
              </h3>
              <p className="mt-3 leading-relaxed text-[var(--ink-soft)]">
                {chapter.body}
              </p>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-12 md:mt-16">
          <StoryPhoto
            src={closingImage.src}
            alt={closingImage.alt}
            width={672}
            height={1082}
          />
        </FadeIn>
      </div>
    </section>
  );
}
