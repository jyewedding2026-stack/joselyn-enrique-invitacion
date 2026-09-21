"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { wedding } from "@/content/wedding";

type EnvelopeOverlayProps = {
  open: boolean;
  onOpen: () => void;
};

export function EnvelopeOverlay({ open, onOpen }: EnvelopeOverlayProps) {
  const reduce = useReducedMotion();
  const touchStartY = useRef<number | null>(null);

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[color-mix(in_oklab,var(--olive-deep)_78%,transparent)] px-6 touch-none md:backdrop-blur-md"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
