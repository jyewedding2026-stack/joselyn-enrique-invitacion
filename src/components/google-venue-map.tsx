"use client";

import { useEffect, useRef, useState } from "react";

type GoogleVenueMapProps = {
  lat: number;
  lng: number;
  label: string;
};

export function GoogleVenueMap({ lat, lng, label }: GoogleVenueMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=es`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="h-52 w-full max-w-full overflow-hidden rounded-xl border border-[var(--sand-border)] bg-[var(--sand-muted)] md:h-64"
    >
      {visible ? (
        <iframe
          title={`Mapa de ${label}`}
          src={src}
          className="h-full w-full max-w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-[var(--olive-muted)]">
          Cargando mapa…
        </div>
      )}
    </div>
  );
}
