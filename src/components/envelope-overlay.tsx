"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

type EnvelopeOverlayProps = {
  open: boolean;
  onOpen: () => void;
};

type Phase = "idle" | "pressing" | "opening" | "exiting";

const OPEN_MS = 2600;
const EXIT_MS = 450;

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
      const t = window.setTimeout(() => onOpen(), 200);
      timersRef.current.push(t);
      return;
    }

    setPhase("pressing");
    const t1 = window.setTimeout(() => setPhase("opening"), 180);
    const t2 = window.setTimeout(() => {
      setPhase("exiting");
      onOpen();
    }, OPEN_MS);
    timersRef.current.push(t1, t2);
  }, [clearTimers, onOpen, open]);

  if (!mounted) return null;

  const isAnimating = phase === "pressing" || phase === "opening";
  const isOpening = phase === "opening";
  const isPressing = phase === "pressing";
  const isExiting = phase === "exiting";

  return (
    <div
      className={`envelope-overlay ${isExiting ? "envelope-overlay--exit" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Abrir invitación"
      aria-busy={isAnimating}
    >
      <button
        type="button"
        className="envelope-overlay__hit"
        onClick={beginOpen}
        disabled={phase !== "idle"}
        aria-label="Haz clic para abrir la invitación"
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
              <span className="envelope__card-initials">J&E</span>
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
      </button>
    </div>
  );
}
