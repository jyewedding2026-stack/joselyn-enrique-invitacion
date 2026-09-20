"use client";

import dynamic from "next/dynamic";

const VenueMap = dynamic(
  () => import("@/components/venue-map").then((m) => m.VenueMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 w-full items-center justify-center rounded-xl border border-[var(--sand-border)] bg-[var(--sand-muted)] text-sm text-[var(--olive-muted)] md:h-64">
        Cargando mapa…
      </div>
    ),
  }
);

export { VenueMap };
