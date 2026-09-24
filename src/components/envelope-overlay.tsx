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

/** Elegant wine-gold ribbon bow for the invitation card. */
function RibbonBow() {
  return (
    <svg
      className="invitation-card__lazo"
      viewBox="0 0 120 56"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="lazo-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9a3f45" />
          <stop offset="42%" stopColor="#c45c58" />
          <stop offset="100%" stopColor="#7a2f36" />
        </linearGradient>
        <linearGradient id="lazo-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2c48a" />
          <stop offset="55%" stopColor="#c4a070" />
          <stop offset="100%" stopColor="#9a7548" />
        </linearGradient>
      </defs>
      {/* Left loop */}
      <path
        d="M58 26 C42 8 18 10 14 22 C10 34 28 40 52 32 Z"
        fill="url(#lazo-fill)"
        opacity="0.95"
      />
      {/* Right loop */}
      <path
        d="M62 26 C78 8 102 10 106 22 C110 34 92 40 68 32 Z"
        fill="url(#lazo-fill)"
        opacity="0.95"
      />
      {/* Left tail */}
      <path
        d="M52 32 C40 38 28 48 22 54 C34 50 46 44 54 36 Z"
        fill="url(#lazo-fill)"
      />
      {/* Right tail */}
      <path
        d="M68 32 C80 38 92 48 98 54 C86 50 74 44 66 36 Z"
        fill="url(#lazo-fill)"
      />
      {/* Knot */}
      <ellipse cx="60" cy="28" rx="9" ry="7.5" fill="url(#lazo-gold)" />
      <ellipse
        cx="60"
        cy="27.5"
        rx="5.5"
        ry="4.5"
        fill="#7a2f36"
        opacity="0.35"
      />
      {/* Soft highlight on loops */}
      <path
        d="M48 20 C40 14 28 15 24 20"
        fill="none"
        stroke="#f0c8c4"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M72 20 C80 14 92 15 96 20"
        fill="none"
        stroke="#f0c8c4"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
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
          <div className="envelope-glow" aria-hidden />
          <div className="envelope-back" aria-hidden />
          <div className="envelope-lining" aria-hidden />
          <div className="envelope-pocket" aria-hidden />

          <motion.button
            type="button"
            className={`invitation-card ${
              phase === "revealed" ? "invitation-card--active" : ""
            }`}
            initial={false}
            animate={
              showCard
                ? { y: -158, scale: 1.05, opacity: 1 }
                : { y: 78, scale: 0.94, opacity: 0 }
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
            <RibbonBow />
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
                    if (e.pointerType === "mouse" && e.button !== 0) return;
                    e.preventDefault();
                    e.stopPropagation();
                    breakSeal();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    breakSeal();
                  }}
                  aria-label="Romper el sello y abrir el sobre"
                >
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
