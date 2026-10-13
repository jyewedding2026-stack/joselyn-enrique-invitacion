import { wedding } from "@/content/wedding";

const nav = [
  { href: "#historia", label: "Historia" },
  { href: "#logistica", label: "Logística" },
  { href: "#dress-code", label: "Dress code" },
  { href: "#rsvp", label: "Confirmar" },
  { href: "#album", label: "Álbum" },
];

export function SiteHeader() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40 [&_a]:pointer-events-auto">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <a href="#inicio" className="inline-flex shrink-0 items-center">
          {/* Relative path for the path-hosted static export */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="./images/logo-je.png"
            alt={wedding.couple.displayName}
            width={546}
            height={519}
            className="h-14 w-auto object-contain object-left md:h-16"
            style={{
              filter:
                "brightness(0) invert(0.97) sepia(0.25) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45)) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4))",
            }}
          />
        </a>
        <nav className="hidden items-center gap-5 text-sm text-white/90 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#rsvp"
          className="rounded-md border border-white/40 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition hover:bg-white/20 md:hidden"
        >
          Confirmar
        </a>
      </div>
    </header>
  );
}
