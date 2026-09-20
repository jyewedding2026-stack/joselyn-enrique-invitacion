"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { savePass } from "@/lib/storage";
import { useOrigin, usePasses } from "@/hooks/use-client-store";

export default function PaseIndexPage() {
  const router = useRouter();
  const passes = usePasses();
  const origin = useOrigin();
  const [familyName, setFamilyName] = useState("");
  const [guestCount, setGuestCount] = useState("2");

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
    toast.success("Pase creado");
    router.push(`/pase/${pass.id}`);
  }

  return (
    <main className="min-h-svh bg-[var(--warm-white)]">
      <div className="mx-auto max-w-lg px-5 py-10 md:px-8">
        <Link
          href="/#pase"
          className="text-sm text-[var(--olive)] underline-offset-4 hover:underline"
        >
          ← Volver
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl text-[var(--olive-deep)]">
          {wedding.pass.title}
        </h1>
        <p className="mt-2 text-[var(--ink-soft)]">{wedding.pass.description}</p>

        <form
          onSubmit={onCreate}
          className="mt-8 space-y-4 rounded-xl border border-[var(--sand-border)] bg-[var(--sand-muted)]/40 p-5"
        >
          <div className="space-y-2">
            <Label htmlFor="family">Invitado o familia</Label>
            <Input
              id="family"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Familia Pérez"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="count">Personas</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={20}
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[var(--olive)] text-[var(--warm-white)] hover:bg-[var(--olive-deep)]"
          >
            Generar pase
          </Button>
        </form>

        {passes.length > 0 && (
          <ul className="mt-8 space-y-3">
            {passes.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--sand-border)] px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--olive-deep)]">
                    {p.familyName}
                  </p>
                  <p className="text-xs text-[var(--olive-muted)]">
                    {p.guestCount} persona(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <QRCodeSVG
                    value={`${origin}/pase/${p.id}`}
                    size={48}
                    bgColor="transparent"
                    fgColor="#3f4a32"
                  />
                  <Link
                    href={`/pase/${p.id}`}
                    className="text-sm text-[var(--olive)] underline-offset-4 hover:underline"
                  >
                    Ver
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
