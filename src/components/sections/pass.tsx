"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import { savePass, type DigitalPass } from "@/lib/storage";
import { useOrigin, usePasses } from "@/hooks/use-client-store";

const fieldClass =
  "h-10 w-full rounded-lg border border-[var(--sand-border)] bg-[var(--warm-white)] px-3 text-base text-[var(--ink)] outline-none focus-visible:border-[var(--olive)] focus-visible:ring-2 focus-visible:ring-[var(--olive)]/30";

export function PassSection() {
  const passes = usePasses();
  const origin = useOrigin();
  const [familyName, setFamilyName] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [latest, setLatest] = useState<DigitalPass | null>(null);

  function createPass() {
    const name = familyName.trim();
    if (!name) {
      toast.error("Indica el nombre del invitado o familia.");
      return;
    }
    const count = Number(guestCount);
    if (!Number.isFinite(count) || count < 1 || count > 20) {
      toast.error("El número de personas debe estar entre 1 y 20.");
      return;
    }
    const pass = savePass({ familyName: name, guestCount: count });
    setLatest(pass);
    setFamilyName("");
    toast.success("Pase digital generado.");
  }

  const passUrl = latest ? `${origin || ""}/pase/${latest.id}` : "";

  return (
    <section id="pase" className="invite-panel section-shell bg-[var(--sand)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">Acceso</p>
          <h2 className="section-title">{wedding.pass.title}</h2>
          <p className="section-lead mt-4 max-w-2xl">
            {wedding.pass.description}
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <FadeIn>
            <form
              className="space-y-4 rounded-xl border border-[var(--sand-border)] bg-[var(--warm-white)] p-5 md:p-6"
              onSubmit={(e) => {
                e.preventDefault();
                createPass();
              }}
            >
              <div className="space-y-2">
                <label htmlFor="pass-family" className="text-sm font-medium">
                  Invitado o familia
                </label>
                <input
                  id="pass-family"
                  name="familyName"
                  className={fieldClass}
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Familia Pérez"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="pass-count" className="text-sm font-medium">
                  Personas en el pase
                </label>
                <input
                  id="pass-count"
                  name="guestCount"
                  type="number"
                  min={1}
                  max={20}
                  className={fieldClass}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="inline-flex h-11 items-center rounded-lg bg-[var(--olive)] px-5 text-base font-medium text-[var(--warm-white)] hover:bg-[var(--olive-deep)]"
                onClick={createPass}
              >
                Generar pase QR
              </button>
            </form>
          </FadeIn>

          <FadeIn delay={0.08}>
            {latest ? (
              <div className="flex flex-col items-center rounded-xl border border-[var(--sand-border)] bg-[var(--warm-white)] p-6 text-center">
                <p className="text-sm tracking-wide text-[var(--olive)] uppercase">
                  Pase listo
                </p>
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--olive-deep)]">
                  {latest.familyName}
                </h3>
                <p className="text-sm text-[var(--ink-soft)]">
                  {latest.guestCount} persona(s)
                </p>
                <div className="mt-5 rounded-lg bg-[var(--sand-muted)]/60 p-4">
                  <QRCodeSVG
                    value={passUrl || `/pase/${latest.id}`}
                    size={160}
                    bgColor="transparent"
                    fgColor="#3f4a32"
                  />
                </div>
                <Link
                  href={`/pase/${latest.id}`}
                  className="mt-4 inline-flex h-9 items-center rounded-lg border border-[var(--olive)]/30 px-3 text-sm text-[var(--olive-deep)] hover:bg-[var(--sand-muted)]/40"
                >
                  Ver pase completo
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--sand-border)] bg-[var(--warm-white)]/60 p-6 text-sm text-[var(--ink-soft)]">
                Genera un pase para ver el código QR único. Los pases se guardan
                en este navegador.
              </div>
            )}

            {passes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-[var(--olive-deep)]">
                  Pases guardados
                </h3>
                <ul className="mt-2 space-y-2">
                  {passes.slice(0, 6).map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/pase/${p.id}`}
                        className="text-sm text-[var(--olive)] underline-offset-4 hover:underline"
                      >
                        {p.familyName} · {p.guestCount} pax
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
