import { wedding } from "@/content/wedding";

const nav = [
  { href: "#historia", label: "Historia" },
  { href: "#logistica", label: "Logística" },
  { href: "#dress-code", label: "Dress code" },
  { href: "#rsvp", label: "RSVP" },
  { href: "#album", label: "Álbum" },
  { href: "#pase", label: "Pase" },
];

export function SiteHeader() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40 [&_a]:pointer-events-auto">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
        <a
          href="#inicio"
          className="font-[family-name:var(--font-display)] text-lg tracking-wide text-white drop-shadow-sm md:text-xl"
        >
          {wedding.couple.displayName}
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
