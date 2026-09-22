"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { savePass } from "@/lib/storage";
import { useOrigin, usePasses } from "@/hooks/use-client-store";
import { passPath } from "@/lib/pass-url";

const fieldClass =
  "h-10 w-full rounded-lg border border-[var(--sand-border)] bg-[var(--warm-white)] px-3 text-base text-[var(--ink)] outline-none focus-visible:border-[var(--olive)] focus-visible:ring-2 focus-visible:ring-[var(--olive)]/30";

export default function PaseIndexPage() {
  const router = useRouter();
  const passes = usePasses();
  const origin = useOrigin();
  const [familyName, setFamilyName] = useState("");
  const [guestCount, setGuestCount] = useState("2");
  const [pending, setPending] = useState(false);

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
    setPending(true);
    try {
      const pass = savePass({ familyName: name, guestCount: count });
      toast.success("Pase creado");
      router.push(passPath(pass.id));
    } catch {
      setPending(false);
      toast.error("No se pudo crear el pase.");
    }
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
          className="mt-8 space-y-4 rounded-xl border border-[var(--sand-border)] bg-[var(--sand-muted)]/40 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            createPass();
          }}
        >
          <div className="space-y-2">
            <label htmlFor="family" className="text-sm font-medium">
              Invitado o familia
            </label>
            <input
              id="family"
              name="familyName"
              className={fieldClass}
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Familia Pérez"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="count" className="text-sm font-medium">
              Personas
            </label>
            <input
              id="count"
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
            disabled={pending}
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--olive)] text-sm font-medium text-[var(--warm-white)] hover:bg-[var(--olive-deep)] disabled:opacity-60"
            onClick={createPass}
          >
            {pending ? "Generando…" : "Generar pase"}
          </button>
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
                    value={`${origin}${passPath(p.id)}`}
                    size={48}
                    bgColor="transparent"
                    fgColor="#3f4a32"
                  />
                  <Link
                    href={passPath(p.id)}
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
