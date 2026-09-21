"use client";

type GoogleVenueMapProps = {
  lat: number;
  lng: number;
  label: string;
};

export function GoogleVenueMap({ lat, lng, label }: GoogleVenueMapProps) {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=es`;

  return (
    <div className="h-56 w-full overflow-hidden rounded-xl border border-[var(--sand-border)] bg-[var(--sand-muted)] md:h-64">
      <iframe
        title={`Mapa de ${label}`}
        src={src}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
