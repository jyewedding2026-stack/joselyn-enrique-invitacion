"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type EnvelopeOverlayProps = {
  /** When true, the welcome overlay is visible (envelope closed). */
  open: boolean;
  /** Called after the open animation finishes — reveals the main invite. */
  onOpen: () => void;
};

type Phase = "idle" | "pressing" | "opening" | "exiting";

const PRESS_MS = 200;
const OPEN_MS = 2800;
const EXIT_MS = 500;

export function EnvelopeOverlay({ open, onOpen }: EnvelopeOverlayProps) {
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<Phase>("idle");
  const startedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("idle");
      startedRef.current = false;
      return;
    }
    if (!mounted) return;
    setPhase("exiting");
    const t = window.setTimeout(() => {
      setMounted(false);
      setPhase("idle");
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted || phase === "exiting") return;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [mounted, phase]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const beginOpen = useCallback(() => {
    if (startedRef.current || !open) return;
    startedRef.current = true;
    clearTimers();

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setPhase("exiting");
      const t = window.setTimeout(() => {
        window.scrollTo(0, 0);
        onOpen();
      }, 180);
      timersRef.current.push(t);
      return;
    }

    setPhase("pressing");
    const t1 = window.setTimeout(() => setPhase("opening"), PRESS_MS);
    const t2 = window.setTimeout(() => {
      setPhase("exiting");
      window.scrollTo(0, 0);
      onOpen();
    }, OPEN_MS);
    timersRef.current.push(t1, t2);
  }, [clearTimers, onOpen, open]);

  if (!mounted) return null;

  const isAnimating = phase === "pressing" || phase === "opening";
  const isOpening = phase === "opening";
  const isPressing = phase === "pressing";
  const isExiting = phase === "exiting";
  const canClick = phase === "idle";

  return (
    <div
      className={`envelope-overlay ${isExiting ? "envelope-overlay--exit" : ""} ${
        isOpening ? "envelope-overlay--opening" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Abrir invitación"
      aria-busy={isAnimating}
      onClick={canClick ? beginOpen : undefined}
      onKeyDown={
        canClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                beginOpen();
              }
            }
          : undefined
      }
      tabIndex={canClick ? 0 : -1}
    >
      <div
        className={`envelope-stage ${isOpening ? "envelope-stage--open" : ""} ${
          isPressing ? "envelope-stage--press" : ""
        }`}
      >
        <div className="envelope" aria-hidden>
          <div className="envelope__shadow" />
          <div className="envelope__back" />
          <div className="envelope__card">
            <span className="envelope__card-line" />
            <span className="envelope__card-initials">J&E</span>
            <span className="envelope__card-line" />
          </div>
          <div className="envelope__pocket" />
          <div className="envelope__flap">
            <div className="envelope__flap-face envelope__flap-face--front" />
            <div className="envelope__flap-face envelope__flap-face--back" />
          </div>
          <div className="envelope__seal">
            <Image
              src="/images/wax-seal-je.webp"
              alt=""
              width={512}
              height={512}
              className="envelope__seal-img"
              priority
              draggable={false}
            />
          </div>
        </div>

        <p
          className={`envelope-hint ${
            isAnimating || isExiting ? "envelope-hint--hide" : ""
          }`}
        >
          Haz clic para abrir
        </p>
      </div>
    </div>
  );
}
