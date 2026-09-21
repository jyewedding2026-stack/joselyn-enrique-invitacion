"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { useOrigin } from "@/hooks/use-client-store";

export function AlbumCtaSection() {
  const origin = useOrigin();
  const albumUrl = origin ? `${origin}/album` : "/album";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        origin ? albumUrl : `${window.location.origin}/album`
      );
      toast.success("Enlace del álbum copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  return (
    <section id="album" className="relative z-10 section-shell bg-[var(--warm-white)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <FadeIn>
            <p className="section-eyebrow">Recuerdos</p>
            <h2 className="section-title">{wedding.album.title}</h2>
            <p className="section-lead mt-4 max-w-xl">
              {wedding.album.description} {wedding.album.shareHint}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                render={<Link href="/album" />}
                size="lg"
                className="bg-[var(--olive)] text-[var(--warm-white)] hover:bg-[var(--olive-deep)]"
              >
                Ir al álbum
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="border-[var(--olive)]/30 text-[var(--olive-deep)]"
                onClick={() => void copyLink()}
              >
                Copiar enlace
              </Button>
            </div>
            <p className="mt-3 break-all text-xs text-[var(--olive-muted)]">
              {albumUrl}
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="flex justify-center md:justify-end">
            <div className="rounded-xl border border-[var(--sand-border)] bg-[var(--sand-muted)]/50 p-5">
              <QRCodeSVG
                value={albumUrl}
                size={168}
                bgColor="transparent"
                fgColor="#3f4a32"
                level="M"
              />
              <p className="mt-3 text-center text-xs text-[var(--olive-muted)]">
                Escanea para abrir el álbum
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
