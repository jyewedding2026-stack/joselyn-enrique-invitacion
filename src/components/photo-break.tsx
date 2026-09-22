"use client";

type PhotoBreakProps = {
  src: string;
  alt: string;
};

export function PhotoBreak({ src, alt }: PhotoBreakProps) {
  return (
    <div className="relative z-0 h-[115svh] w-full md:h-[135svh]">
      <div className="sticky top-0 h-[62svh] w-full overflow-hidden md:h-[80svh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,48,28,0.15),rgba(40,48,28,0.35))]" />
      </div>
    </div>
  );
}
