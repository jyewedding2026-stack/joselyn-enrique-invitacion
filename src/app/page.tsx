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

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const revealInvite = useCallback(() => setShowWelcome(false), []);

  return (
    <>
      <EnvelopeOverlay open={showWelcome} onOpen={revealInvite} />
      <div
        className={
          showWelcome ? "invite-shell invite-shell--veiled" : "invite-shell"
        }
      >
        <SiteHeader />
        <main className="relative">
          <HeroSection />
          <StorySection />
          <LogisticsSection />
          <DressCodeSection />
          <LodgingSection />
          <GiftsSection />
          <RsvpSection />
          <AlbumCtaSection />
        </main>
        <footer className="relative z-10 border-t border-[var(--sand-border)] bg-[var(--warm-white)] py-10 text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--olive-deep)]">
            {wedding.couple.displayName}
          </p>
          <p className="mt-1 text-sm text-[var(--olive-muted)]">
            {wedding.date.display} · Ica
          </p>
        </footer>
      </div>
    </>
  );
}
