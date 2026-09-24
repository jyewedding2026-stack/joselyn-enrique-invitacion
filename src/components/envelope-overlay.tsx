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
  /** When true, the welcome overlay is visible. */
  open: boolean;
  /** Reveals the main invitation (existing page content). */
  onOpen: () => void;
};

type Phase = "idle" | "opening" | "revealed" | "exiting";

const FLAP_EASE: [number, number, number, number] = [0.25, 1, 0.5, 1];
const FLAP_S = 0.8;
const CARD_DELAY_S = 0.45;
const EXIT_MS = 480;

/** Relative to current page URL — works on Arweave path hosts and local serve. */
function waxSealSrc(): string {
  if (typeof window === "undefined") return "./images/wax-seal-je.webp";
  try {
    return new URL("images/wax-seal-je.webp", window.location.href).href;
  } catch {
    return "./images/wax-seal-je.webp";
  }
}

export function EnvelopeOverlay({ open, onOpen }: EnvelopeOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sealSrc, setSealSrc] = useState("./images/wax-seal-je.webp");
  const openTimerRef = useRef<number | null>(null);
  const sealLockRef = useRef(false);

  useEffect(() => {
    setSealSrc(waxSealSrc());
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("idle");
      sealLockRef.current = false;
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

  useEffect(
    () => () => {
      if (openTimerRef.current != null) {
        window.clearTimeout(openTimerRef.current);
      }
    },
    [],
  );

  const enterInvite = useCallback(() => {
    if (phase !== "revealed") return;
    setPhase("exiting");
    window.scrollTo(0, 0);
    onOpen();
  }, [onOpen, phase]);

  const breakSeal = useCallback(() => {
    if (phase !== "idle" || !open || sealLockRef.current) return;
    sealLockRef.current = true;

    if (reduceMotion) {
      setPhase("revealed");
      return;
    }

    setPhase("opening");
    if (openTimerRef.current != null) {
      window.clearTimeout(openTimerRef.current);
    }
    openTimerRef.current = window.setTimeout(() => {
      setPhase("revealed");
      openTimerRef.current = null;
    }, (FLAP_S + CARD_DELAY_S + 0.4) * 1000);
  }, [open, phase, reduceMotion]);

  if (!mounted) return null;

  const flapOpen = phase === "opening" || phase === "revealed";
  const showCard = flapOpen;
  const sealGone = phase !== "idle";
  const isExiting = phase === "exiting";

  const flapTransition: Transition = reduceMotion
    ? { duration: 0.01 }
    : { duration: FLAP_S, ease: FLAP_EASE, delay: 0.12 };

  const cardTransition: Transition = reduceMotion
    ? { duration: 0.2 }
    : {
        duration: 0.85,
        ease: FLAP_EASE,
        delay: showCard ? CARD_DELAY_S : 0,
      };

  return (
    <motion.div
      className={`envelope-overlay ${isExiting ? "envelope-overlay--exit" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Abrir invitación"
      aria-busy={phase === "opening"}
      initial={false}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: "easeOut" }}
    >
      <div className="envelope-scene">
        <div className="envelope">
          <div className="envelope-back" aria-hidden />
          <div className="envelope-pocket" aria-hidden />

          <motion.button
            type="button"
            className={`invitation-card ${
              phase === "revealed" ? "invitation-card--active" : ""
            }`}
            initial={false}
            animate={
              showCard
                ? { y: -150, scale: 1.04, opacity: 1 }
                : { y: 72, scale: 0.94, opacity: 0 }
            }
            transition={cardTransition}
            onClick={phase === "revealed" ? enterInvite : undefined}
            disabled={phase !== "revealed"}
            tabIndex={phase === "revealed" ? 0 : -1}
            aria-hidden={phase !== "revealed"}
            aria-label={
              phase === "revealed"
                ? "Ver invitación"
                : "Tarjeta de la invitación"
            }
          >
            <span className="invitation-card__ornament" aria-hidden />
            <p className="invitation-card__eyebrow">Nuestra boda</p>
            <h2 className="invitation-card__names">
              {wedding.couple.displayName}
            </h2>
            <span className="invitation-card__rule" aria-hidden />
            <p className="invitation-card__date">{wedding.date.display}</p>
            <p className="invitation-card__place">Ica · Perú</p>
            <AnimatePresence>
              {phase === "revealed" && (
                <motion.span
                  className="invitation-card__cta"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.08 }}
                >
                  Ver invitación
                </motion.span>
              )}
            </AnimatePresence>
            <span className="invitation-card__floral" aria-hidden />
          </motion.button>

          <motion.div
            className="envelope-flap"
            initial={false}
            animate={{ rotateX: flapOpen ? 180 : 0 }}
            transition={flapTransition}
            style={{
              transformOrigin: "top center",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
            }}
            aria-hidden
          >
            <div className="envelope-flap__front" />
            <div className="envelope-flap__back" />
          </motion.div>

          <div className="wax-seal-anchor">
            <AnimatePresence>
              {!sealGone && (
                <motion.button
                  type="button"
                  key="wax-seal"
                  className="wax-seal"
                  initial={{ opacity: 1, scale: 1 }}
                  exit={
                    reduceMotion
                      ? { opacity: 0, scale: 0.92, transition: { duration: 0.15 } }
                      : {
                          opacity: 0,
                          scale: 1.08,
                          y: -16,
                          rotate: -10,
                          transition: { duration: 0.45, ease: FLAP_EASE },
                        }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  onPointerUp={(e) => {
                    // Prefer pointerUp on touch; ignore secondary mouse click double-fire
                    if (e.pointerType === "mouse" && e.button !== 0) return;
                    e.preventDefault();
                    e.stopPropagation();
                    breakSeal();
                  }}
                  onClick={(e) => {
                    // Fallback for older WebViews that skip pointer events
                    e.preventDefault();
                    e.stopPropagation();
                    breakSeal();
                  }}
                  aria-label="Romper el sello y abrir el sobre"
                >
                  {/* Plain img + relative path for Arweave / static export */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sealSrc}
                    alt=""
                    width={160}
                    height={160}
                    className="wax-seal__img"
                    decoding="async"
                    fetchPriority="high"
                    draggable={false}
                  />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {phase === "idle" && (
            <motion.p
              className="envelope-hint"
              initial={{ opacity: 0.65 }}
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
              Toca el sello para abrir
            </motion.p>
          )}
        </AnimatePresence>

        {phase === "revealed" && (
          <motion.button
            type="button"
            className="envelope-enter"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.35, delay: 0.06 }}
            onClick={enterInvite}
          >
            Ver invitación
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
