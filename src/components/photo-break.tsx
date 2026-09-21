"use client";

import Image from "next/image";

export function PhotoBreak({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="relative z-0 h-[115svh] w-full md:h-[135svh]">
      <div className="sticky top-0 h-[62svh] w-full overflow-hidden md:h-[80svh]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(40,48,28,0.15),rgba(40,48,28,0.35))]" />
      </div>
    </div>
  );
}
