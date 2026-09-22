"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { wedding } from "@/content/wedding";
import { useOrigin, usePassById } from "@/hooks/use-client-store";
import { passPath } from "@/lib/pass-url";

function PaseDetailInner() {
  const search = useSearchParams();
  const id = search.get("id") ?? undefined;
  const pass = usePassById(id);
  const origin = useOrigin();
  const url = id ? `${origin || ""}${passPath(id)}` : "";

  if (!id) {
    return (
      <main className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-5 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--olive-deep)]">
          Pase no encontrado
        </h1>
        <Link
          href="/pase"
          className="mt-6 text-[var(--olive)] underline-offset-4 hover:underline"
        >
          Generar un pase
        </Link>
      </main>
    );
  }

  if (!pass) {
    return (
      <main className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-5 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--olive-deep)]">
          Pase no encontrado
        </h1>
        <p className="mt-2 text-[var(--ink-soft)]">
          Este código no existe en este navegador. Los pases son locales: genera
          uno nuevo o ábrelo desde el mismo dispositivo donde se creó.
        </p>
        <Link
          href="/pase"
          className="mt-6 text-[var(--olive)] underline-offset-4 hover:underline"
        >
          Generar un pase
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-svh bg-[var(--sand)]">
      <div className="mx-auto flex min-h-svh max-w-md flex-col px-5 py-10">
        <Link
          href="/pase"
          className="text-sm text-[var(--olive)] underline-offset-4 hover:underline"
        >
          ← Todos los pases
        </Link>

        <article className="mt-8 flex flex-1 flex-col items-center rounded-2xl border border-[var(--sand-border)] bg-[var(--warm-white)] px-6 py-10 text-center shadow-sm">
          <p className="text-xs tracking-[0.25em] text-[var(--olive)] uppercase">
            Pase digital
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--olive-deep)]">
            {wedding.couple.displayName}
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {wedding.date.display}
          </p>

          <div className="my-8 rounded-xl bg-[var(--sand-muted)]/50 p-5">
            <QRCodeSVG
              value={url || passPath(pass.id)}
              size={200}
              bgColor="transparent"
              fgColor="#3f4a32"
              level="M"
            />
          </div>

          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--olive-deep)]">
            {pass.familyName}
          </h2>
          <p className="mt-1 text-[var(--ink-soft)]">
            {pass.guestCount} persona(s)
          </p>
          <p className="mt-6 text-xs text-[var(--olive-muted)]">
            Presenta este código en la entrada · ID {pass.id}
          </p>
        </article>
      </div>
    </main>
  );
}

export default function PaseDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-svh max-w-lg items-center justify-center px-5">
          <p className="text-[var(--ink-soft)]">Cargando pase…</p>
        </main>
      }
    >
      <PaseDetailInner />
    </Suspense>
  );
}
