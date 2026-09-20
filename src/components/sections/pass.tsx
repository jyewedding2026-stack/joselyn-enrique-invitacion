"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { savePass } from "@/lib/storage";
import { useOrigin, usePasses } from "@/hooks/use-client-store";
import type { DigitalPass } from "@/lib/storage";

export function PassSection() {
  const passes = usePasses();
  const origin = useOrigin();
  const [familyName, setFamilyName] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [latest, setLatest] = useState<DigitalPass | null>(null);

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
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
    <section id="pase" className="section-shell bg-[var(--sand)]">
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
              onSubmit={onCreate}
              className="space-y-4 rounded-xl border border-[var(--sand-border)] bg-[var(--warm-white)] p-5 md:p-6"
            >
              <div className="space-y-2">
                <Label htmlFor="pass-family">Invitado o familia</Label>
                <Input
                  id="pass-family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Familia Pérez"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass-count">Personas en el pase</Label>
                <Input
                  id="pass-count"
                  type="number"
                  min={1}
                  max={20}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-[var(--olive)] text-[var(--warm-white)] hover:bg-[var(--olive-deep)]"
              >
                Generar pase QR
              </Button>
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
                <Button
                  render={<Link href={`/pase/${latest.id}`} />}
                  variant="outline"
                  className="mt-4 border-[var(--olive)]/30"
                >
                  Ver pase completo
                </Button>
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
