"use client";

import { useEffect, useRef, useState } from "react";
import { wedding } from "@/content/wedding";

type EnvelopeOverlayProps = {
  open: boolean;
  onOpen: () => void;
};

export function EnvelopeOverlay({ open, onOpen }: EnvelopeOverlayProps) {
  const touchStartY = useRef<number | null>(null);
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setExiting(false);
      return;
    }
    if (!mounted) return;
    setExiting(true);
    const t = window.setTimeout(() => {
      setMounted(false);
      setExiting(false);
    }, 380);
    return () => window.clearTimeout(t);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-[var(--olive-deep)] px-6 touch-none transition-opacity duration-350 md:bg-[color-mix(in_oklab,var(--olive-deep)_82%,black)] md:backdrop-blur-sm ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
      role="dialog"
      aria-label="Abrir invitación"
      onTouchStart={(e) => {
        touchStartY.current = e.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartY.current;
        touchStartY.current = null;
        if (start == null) return;
        const end = e.changedTouches[0]?.clientY;
        if (end == null) return;
        if (end - start > 48) onOpen();
      }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="relative w-full max-w-sm touch-auto rounded-[1.5rem] border border-white/25 bg-[var(--warm-white)]/95 px-8 py-12 text-center shadow-[0_24px_60px_rgba(40,48,28,0.35)]"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-[var(--olive)] bg-[var(--sand)] font-[family-name:var(--font-display)] text-xl text-[var(--olive-deep)]">
          J&E
        </span>
        <p className="mt-6 text-xs tracking-[0.28em] text-[var(--olive)] uppercase">
          Invitación
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--olive-deep)]">
          {wedding.couple.displayName}
        </h2>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          {wedding.date.display} · Ica
        </p>
        <p className="mt-8 text-sm font-medium text-[var(--olive-deep)]">
          Toca para abrir
        </p>
        <span className="mt-2 block text-xs text-[var(--olive-muted)]">
          o desliza hacia abajo
        </span>
      </button>
    </div>
  );
}
