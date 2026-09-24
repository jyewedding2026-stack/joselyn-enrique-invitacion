"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { wedding } from "@/content/wedding";

type EnvelopeOverlayProps = {
  open: boolean;
  onOpen: () => void;
};

/**
 * Sponsalia TikTok reference (7669384565022133537) interaction:
 * 0.0s  tap silver bow on closed gatefold
 * 0–0.6s ribbon splits & slides L/R off
 * 0.3–1.2s left/right flaps open (gatefold)
 * 1.2–2.0s invitation text fades in on center card
 * then “Ver invitación” → onOpen()
 */
type Phase = "idle" | "untying" | "opening" | "revealed" | "exiting";

const EASE: [number, number, number, number] = [0.25, 1, 0.5, 1];
const EXIT_MS = 480;

function SilverBow() {
  return (
    <svg
      className="ribbon-bow__svg"
      viewBox="0 0 160 90"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="satin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f4f4f6" />
          <stop offset="35%" stopColor="#c8cad0" />
          <stop offset="55%" stopColor="#e8e9ed" />
          <stop offset="100%" stopColor="#9a9da6" />
        </linearGradient>
        <linearGradient id="satin-deep" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d8dae0" />
          <stop offset="100%" stopColor="#7e828c" />
        </linearGradient>
      </defs>
      {/* Left loop */}
      <path
        d="M78 38 C52 10 22 14 16 32 C10 50 36 58 70 46 Z"
        fill="url(#satin)"
      />
      {/* Right loop */}
      <path
        d="M82 38 C108 10 138 14 144 32 C150 50 124 58 90 46 Z"
        fill="url(#satin)"
      />
      {/* Left tail */}
      <path
        d="M72 46 C52 54 34 70 26 84 L48 78 C58 66 68 54 76 48 Z"
        fill="url(#satin-deep)"
      />
      {/* Right tail */}
      <path
        d="M88 46 C108 54 126 70 134 84 L112 78 C102 66 92 54 84 48 Z"
        fill="url(#satin-deep)"
      />
      {/* Knot */}
      <ellipse cx="80" cy="42" rx="12" ry="10" fill="url(#satin)" />
      <ellipse cx="80" cy="41" rx="7" ry="5.5" fill="#6e727a" opacity="0.28" />
      {/* Sheen */}
      <path
        d="M58 28 C48 22 34 24 28 30"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M102 28 C112 22 126 24 132 30"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function EnvelopeOverlay({ open, onOpen }: EnvelopeOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<Phase>("idle");
  const lockRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("idle");
      lockRef.current = false;
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

  const enterInvite = useCallback(() => {
    if (phase !== "revealed") return;
    setPhase("exiting");
    window.scrollTo(0, 0);
    onOpen();
  }, [onOpen, phase]);

  const beginOpen = useCallback(() => {
    if (phase !== "idle" || !open || lockRef.current) return;
    lockRef.current = true;
    clearTimers();

    if (reduceMotion) {
      setPhase("revealed");
      return;
    }

    setPhase("untying");
    timersRef.current.push(
      window.setTimeout(() => setPhase("opening"), 320),
      window.setTimeout(() => setPhase("revealed"), 1400),
    );
  }, [clearTimers, open, phase, reduceMotion]);

  if (!mounted) return null;

  const ribbonGone = phase !== "idle";
  const flapsOpen = phase === "opening" || phase === "revealed";
  const cardShown = phase === "revealed" || (reduceMotion && phase !== "idle");
  const isExiting = phase === "exiting";

  const flapTransition: Transition = reduceMotion
    ? { duration: 0.01 }
    : { duration: 0.9, ease: EASE, delay: 0.05 };

  const ribbonTransition: Transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.55, ease: EASE };

  return (
    <motion.div
      className={`envelope-overlay ${isExiting ? "envelope-overlay--exit" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Abrir invitación"
      aria-busy={phase === "untying" || phase === "opening"}
      initial={false}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: "easeOut" }}
    >
      <div className="envelope-scene">
        <div className={`envelope ${flapsOpen ? "envelope--open" : ""}`}>
          <div className="envelope-glow" aria-hidden />

          {/* Center invitation card (under flaps) */}
          <div className="invitation-card" aria-hidden={!cardShown}>
            <motion.div
              className="invitation-card__inner"
              initial={false}
              animate={{ opacity: cardShown ? 1 : 0 }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { duration: 0.7, ease: EASE, delay: 0.15 }
              }
            >
              <p className="invitation-card__eyebrow">Nuestra boda</p>
              <h2 className="invitation-card__names">
                {wedding.couple.displayName}
              </h2>
              <span className="invitation-card__rule" aria-hidden />
              <p className="invitation-card__date">{wedding.date.display}</p>
              <p className="invitation-card__place">Ica · Perú</p>
            </motion.div>
          </div>

          {/* Names sit on closed gatefold (above flaps, under ribbon) */}
          <motion.p
            className="envelope-closed-names"
            initial={false}
            animate={{ opacity: flapsOpen ? 0 : 1 }}
            transition={
              reduceMotion
                ? { duration: 0.1 }
                : { duration: 0.25, ease: EASE }
            }
            aria-hidden
          >
            {wedding.couple.displayName}
          </motion.p>

          {/* Gatefold flaps — left & right (X creases when closed) */}
          <motion.div
            className="envelope-flap envelope-flap--left"
            initial={false}
            animate={{ rotateY: flapsOpen ? -165 : 0 }}
            transition={flapTransition}
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
            }}
            aria-hidden
          >
            <div className="envelope-flap__face" />
          </motion.div>

          <motion.div
            className="envelope-flap envelope-flap--right"
            initial={false}
            animate={{ rotateY: flapsOpen ? 165 : 0 }}
            transition={flapTransition}
            style={{
              transformOrigin: "right center",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
            }}
            aria-hidden
          >
            <div className="envelope-flap__face envelope-flap__face--emboss" />
          </motion.div>

          {/* Silver ribbon wrapping the closed envelope */}
          <AnimatePresence>
            {!ribbonGone && (
              <motion.div
                className="ribbon"
                key="ribbon"
                initial={{ opacity: 1 }}
                exit={
                  reduceMotion
                    ? { opacity: 0, transition: { duration: 0.15 } }
                    : { opacity: 0, transition: { duration: 0.45, delay: 0.15 } }
                }
              >
                <motion.div
                  className="ribbon-band ribbon-band--left"
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { x: "-110%", opacity: 0, transition: ribbonTransition }
                  }
                  aria-hidden
                />
                <motion.div
                  className="ribbon-band ribbon-band--right"
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { x: "110%", opacity: 0, transition: ribbonTransition }
                  }
                  aria-hidden
                />
                <motion.button
                  type="button"
                  className="ribbon-bow"
                  exit={
                    reduceMotion
                      ? { opacity: 0, scale: 0.9 }
                      : {
                          scale: 0.85,
                          opacity: 0,
                          y: 8,
                          transition: { duration: 0.35, ease: EASE },
                        }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                  onPointerUp={(e) => {
                    if (e.pointerType === "mouse" && e.button !== 0) return;
                    e.preventDefault();
                    e.stopPropagation();
                    beginOpen();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    beginOpen();
                  }}
                  aria-label="Desatar el lazo y abrir la invitación"
                >
                  <SilverBow />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === "idle" && (
            <p className="envelope-tap-hint" aria-hidden>
              Toca para abrir
            </p>
          )}
        </div>

        <AnimatePresence>
          {phase === "idle" && (
            <motion.p
              className="envelope-hint"
              initial={{ opacity: 0.6 }}
              animate={
                reduceMotion
                  ? { opacity: 0.85 }
                  : { opacity: [0.55, 1, 0.55] }
              }
              exit={{ opacity: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0.2 }
                  : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
              }
            >
              Toca el lazo para abrir
            </motion.p>
          )}
        </AnimatePresence>

        {phase === "revealed" && (
          <motion.button
            type="button"
            className="envelope-enter"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.35, delay: 0.1 }}
            onClick={enterInvite}
          >
            Ver invitación
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
