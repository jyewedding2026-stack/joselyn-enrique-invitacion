"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import { GoogleVenueMap } from "@/components/google-venue-map";

export function LogisticsSection() {
  const venues = [
    {
      kind: "Ceremonia",
      time: wedding.ceremony.time,
      place: wedding.ceremony.place,
      address: wedding.ceremony.address,
      lat: wedding.ceremony.lat,
      lng: wedding.ceremony.lng,
      mapsUrl: wedding.ceremony.mapsUrl,
    },
    {
      kind: "Recepción",
      time: wedding.reception.time,
      place: wedding.reception.place,
      address: wedding.reception.address,
      lat: wedding.reception.lat,
      lng: wedding.reception.lng,
      mapsUrl: wedding.reception.mapsUrl,
    },
  ];

  return (
    <section id="logistica" className="relative z-10 section-shell bg-[var(--sand)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">El día</p>
          <h2 className="section-title">Logística</h2>
          <p className="section-lead mt-4 max-w-2xl">
            {wedding.date.display} · Ica. Ceremonia a las {wedding.ceremony.time}
            , recepción a las {wedding.reception.time}.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          {venues.map((venue, i) => (
            <FadeIn key={venue.kind} delay={0.08 * i} className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 size-5 shrink-0 text-[var(--olive)]" />
                <div>
                  <p className="text-sm tracking-[0.18em] text-[var(--olive)] uppercase">
                    {venue.kind} · {venue.time}
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--olive-deep)] md:text-3xl">
                    {venue.place}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    {venue.address}
                  </p>
                </div>
              </div>
              <GoogleVenueMap
                lat={venue.lat}
                lng={venue.lng}
                label={venue.place}
              />
              <a
                href={venue.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--olive)]/30 px-3 text-sm font-medium text-[var(--olive-deep)] hover:bg-[var(--warm-white)]"
              >
                Abrir en Google Maps
                <ExternalLink className="size-3.5" />
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
