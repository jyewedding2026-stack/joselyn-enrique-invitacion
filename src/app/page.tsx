"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { EnvelopeOverlay } from "@/components/envelope-overlay";
import { HeroSection } from "@/components/sections/hero";
import { wedding } from "@/content/wedding";

const StorySection = dynamic(
  () =>
    import("@/components/sections/story").then((m) => ({
      default: m.StorySection,
    })),
  { loading: () => null },
);
const LogisticsSection = dynamic(
  () =>
    import("@/components/sections/logistics").then((m) => ({
      default: m.LogisticsSection,
    })),
  { loading: () => null },
);
const DressCodeSection = dynamic(
  () =>
    import("@/components/sections/dress-code").then((m) => ({
      default: m.DressCodeSection,
    })),
  { loading: () => null },
);
const LodgingSection = dynamic(
  () =>
    import("@/components/sections/lodging").then((m) => ({
      default: m.LodgingSection,
    })),
  { loading: () => null },
);
const GiftsSection = dynamic(
  () =>
    import("@/components/sections/gifts").then((m) => ({
      default: m.GiftsSection,
    })),
  { loading: () => null },
);
const RsvpSection = dynamic(
  () =>
    import("@/components/sections/rsvp").then((m) => ({
      default: m.RsvpSection,
    })),
  { loading: () => null },
);
const AlbumCtaSection = dynamic(
  () =>
    import("@/components/sections/album-cta").then((m) => ({
      default: m.AlbumCtaSection,
    })),
  { loading: () => null },
);
const PassSection = dynamic(
  () =>
    import("@/components/sections/pass").then((m) => ({
      default: m.PassSection,
    })),
  { loading: () => null },
);
const PhotoBreak = dynamic(
  () =>
    import("@/components/photo-break").then((m) => ({
      default: m.PhotoBreak,
    })),
  { loading: () => null },
);

export default function HomePage() {
  const [envelopeOpen, setEnvelopeOpen] = useState(true);
  const openInvite = useCallback(() => setEnvelopeOpen(false), []);

  return (
    <>
      <EnvelopeOverlay open={envelopeOpen} onOpen={openInvite} />
      <SiteHeader />
      <main className="relative">
        <HeroSection />
        <StorySection />
        <LogisticsSection />
        <PhotoBreak
          src={wedding.story.chapters[1].image}
          alt={wedding.story.chapters[1].title}
        />
        <DressCodeSection />
        <LodgingSection />
        <PhotoBreak
          src={wedding.story.chapters[2].image}
          alt={wedding.story.chapters[2].title}
        />
        <GiftsSection />
        <RsvpSection />
        <AlbumCtaSection />
        <PassSection />
      </main>
      <footer className="relative z-10 border-t border-[var(--sand-border)] bg-[var(--warm-white)] py-10 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--olive-deep)]">
          {wedding.couple.displayName}
        </p>
        <p className="mt-1 text-sm text-[var(--olive-muted)]">
          {wedding.date.display} · Ica
        </p>
      </footer>
    </>
  );
}
