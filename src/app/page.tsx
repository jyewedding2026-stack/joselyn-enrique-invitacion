"use client";

import { useCallback, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { EnvelopeOverlay } from "@/components/envelope-overlay";
import { PhotoBreak } from "@/components/photo-break";
import { HeroSection } from "@/components/sections/hero";
import { StorySection } from "@/components/sections/story";
import { LogisticsSection } from "@/components/sections/logistics";
import { DressCodeSection } from "@/components/sections/dress-code";
import { LodgingSection } from "@/components/sections/lodging";
import { GiftsSection } from "@/components/sections/gifts";
import { RsvpSection } from "@/components/sections/rsvp";
import { AlbumCtaSection } from "@/components/sections/album-cta";
import { PassSection } from "@/components/sections/pass";
import { wedding } from "@/content/wedding";

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
