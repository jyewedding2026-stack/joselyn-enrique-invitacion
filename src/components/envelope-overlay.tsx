"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { wedding } from "@/content/wedding";

type EnvelopeOverlayProps = {
  open: boolean;
  onOpen: () => void;
};

/**
 * Ewedlab-style petal envelope: sage 4-flap + gold J&E seal.
 * Tap seal → TB flaps → LR flaps + seal split → cream reveal → onOpen().
 */
type Phase = "idle" | "opening" | "revealed" | "exiting";

const EASE_SOFT: [number, number, number, number] = [0.22, 0.8, 0.28, 1];
const EASE_FLAP: [number, number, number, number] = [0.4, 0.02, 0.2, 1];
const EXIT_MS = 520;

/** Open timeline (ms) — matches Ewedlab soft petal unboxing */
const T = {
  press: 220,
  topBottom: 520,
  leftRightDelay: 280,
  leftRight: 780,
  revealHold: 720,
} as const;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Gold botanical vine for flap corners */
function FoilVines({ variant }: { variant: "tl" | "tr" | "bl" | "br" }) {
  const transforms: Record<typeof variant, string> = {
    tl: "rotate(0 50 50)",
    tr: "scale(-1 1) translate(-100 0)",
    bl: "scale(1 -1) translate(0 -100)",
    br: "scale(-1 -1) translate(-100 -100)",
  };
  return (
    <svg
      className="petal-foil"
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
    >
      <g
        transform={transforms[variant]}
        fill="none"
        stroke="url(#foilGrad)"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.72"
      >
        <path d="M8 18 C22 28 28 42 26 58 C24 72 18 82 12 90" />
        <path d="M18 22 C32 30 40 44 42 60" />
        <path d="M26 26 C34 22 42 24 46 32" />
        <path d="M22 40 C30 36 38 38 42 46" />
        <path d="M20 54 C28 50 34 54 36 62" />
        <ellipse cx="46" cy="30" rx="2.2" ry="3.4" fill="#c9a227" opacity="0.55" />
        <ellipse cx="41" cy="44" rx="2" ry="3.1" fill="#c9a227" opacity="0.5" />
        <ellipse cx="35" cy="58" rx="1.8" ry="2.8" fill="#c9a227" opacity="0.45" />
      </g>
    </svg>
  );
}

function GoldSealMark({ initials }: { initials: string }) {
  return (
    <svg
      className="petal-seal__svg"
      viewBox="0 0 120 120"
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="petalWax" cx="36%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f3e0a0" />
          <stop offset="35%" stopColor="#d4ad3a" />
          <stop offset="70%" stopColor="#a67c1a" />
          <stop offset="100%" stopColor="#6e4e0e" />
        </radialGradient>
        <linearGradient id="foilGradSeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8d48a" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#8a6414" />
        </linearGradient>
        <filter id="sealDepth" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b" />
          <feOffset dy="1.4" result="o" />
          <feFlood floodColor="#3a2a08" floodOpacity="0.4" />
          <feComposite in2="o" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#sealDepth)">
        <circle cx="60" cy="60" r="50" fill="url(#petalWax)" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <circle
              key={deg}
              cx={60 + Math.cos(rad) * 48}
              cy={60 + Math.sin(rad) * 48}
              r="7"
              fill="url(#petalWax)"
            />
          );
        })}
        <circle cx="60" cy="60" r="42" fill="url(#petalWax)" />
        <circle
          cx="60"
          cy="60"
          r="34"
          fill="none"
          stroke="#f0d878"
          strokeWidth="1.1"
          opacity="0.5"
        />
        <text
          x="60"
          y="67"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="23"
          fontWeight="600"
          letterSpacing="0.05em"
          fill="#3d2a08"
          opacity="0.5"
        >
          {initials}
        </text>
        <text
          x="60"
          y="65"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="23"
          fontWeight="600"
          letterSpacing="0.05em"
          fill="#fff1c2"
          opacity="0.9"
        >
          {initials}
        </text>
      </g>
    </svg>
  );
}

export function EnvelopeOverlay({ open, onOpen }: EnvelopeOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<Phase>("idle");
  const [flapsOpen, setFlapsOpen] = useState(false);
  const [sealSplit, setSealSplit] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const lockRef = useRef(false);
  const runIdRef = useRef(0);
  const abortRef = useRef(false);

  const cover = wedding.cover;

  const resetMotion = useCallback(() => {
    setFlapsOpen(false);
    setSealSplit(false);
    setShowReveal(false);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("idle");
      lockRef.current = false;
      abortRef.current = false;
      resetMotion();
      return;
    }
    if (!mounted) return;
    abortRef.current = true;
    setPhase("exiting");
    const t = window.setTimeout(() => {
      setMounted(false);
      setPhase("idle");
      resetMotion();
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open, mounted, resetMotion]);

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

  const startOpeningSequence = useCallback(async () => {
    if (phase !== "idle" || !open || lockRef.current) return;
    lockRef.current = true;
    abortRef.current = false;
    const runId = ++runIdRef.current;
    const alive = () =>
      !abortRef.current && runIdRef.current === runId && open;

    if (reduceMotion) {
      setFlapsOpen(true);
      setSealSplit(true);
      setShowReveal(true);
      setPhase("opening");
      await wait(200);
      if (!alive()) return;
      setPhase("revealed");
      await wait(160);
      if (!alive()) return;
      window.scrollTo(0, 0);
      onOpen();
      return;
    }

    setPhase("opening");
    await wait(T.press);
    if (!alive()) return;

    // Top + bottom first, then L/R + seal split (Ewedlab order)
    setFlapsOpen(true);
    await wait(T.leftRightDelay);
    if (!alive()) return;
    setSealSplit(true);
    await wait(T.leftRight);
    if (!alive()) return;

    setShowReveal(true);
    setPhase("revealed");
    await wait(T.revealHold);
    if (!alive()) return;

    window.scrollTo(0, 0);
    onOpen();
  }, [open, onOpen, phase, reduceMotion]);

  const onTap = useCallback(
    (e: PointerEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => {
      if ("pointerType" in e && e.pointerType === "mouse" && e.button !== 0) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      void startOpeningSequence();
    },
    [startOpeningSequence],
  );

  if (!mounted) return null;

  const isExiting = phase === "exiting";
  const isIdle = phase === "idle";

  const tbTransition: Transition = reduceMotion
    ? { duration: 0.12 }
    : { duration: T.topBottom / 1000, ease: EASE_FLAP };

  const lrTransition: Transition = reduceMotion
    ? { duration: 0.12 }
    : {
        duration: T.leftRight / 1000,
        ease: EASE_FLAP,
        delay: reduceMotion ? 0 : T.leftRightDelay / 1000,
      };

  const sealHalfTransition: Transition = reduceMotion
    ? { duration: 0.12 }
    : { duration: T.leftRight / 1000, ease: EASE_FLAP };

  return (
    <motion.div
      className={`petal-overlay ${isExiting ? "petal-overlay--exit" : ""} ${
        flapsOpen ? "petal-overlay--open" : ""
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Abrir invitación"
      aria-busy={phase !== "idle" && phase !== "revealed" && phase !== "exiting"}
      data-phase={phase}
      initial={false}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: "easeOut" }}
    >
      {/* Cream reveal under flaps */}
      <div
        className={`petal-reveal ${showReveal ? "petal-reveal--visible" : ""}`}
        aria-hidden={!showReveal}
      >
        <p className="petal-reveal__eyebrow">{cover.invitedLine}</p>
        <h2 className="petal-reveal__names">{wedding.couple.displayName}</h2>
        <p className="petal-reveal__meta">
          {wedding.date.display}
          <span aria-hidden> · </span>
          {cover.placeLine}
        </p>
      </div>

      <div className="petal-stage">
        {/* Top flap */}
        <motion.div
          className="petal-flap petal-flap--top"
          initial={false}
          animate={
            flapsOpen
              ? { y: "-108%", opacity: 0.15, rotateX: -28 }
              : { y: "0%", opacity: 1, rotateX: 0 }
          }
          transition={tbTransition}
          style={{ transformOrigin: "center top" }}
          aria-hidden
        >
          <FoilVines variant="tl" />
          <FoilVines variant="tr" />
        </motion.div>

        {/* Bottom flap */}
        <motion.div
          className="petal-flap petal-flap--bottom"
          initial={false}
          animate={
            flapsOpen
              ? { y: "108%", opacity: 0.15, rotateX: 28 }
              : { y: "0%", opacity: 1, rotateX: 0 }
          }
          transition={tbTransition}
          style={{ transformOrigin: "center bottom" }}
          aria-hidden
        >
          <FoilVines variant="bl" />
          <FoilVines variant="br" />
        </motion.div>

        {/* Left flap */}
        <motion.div
          className="petal-flap petal-flap--left"
          initial={false}
          animate={
            flapsOpen
              ? { x: "-112%", opacity: 0.1, rotateY: 42 }
              : { x: "0%", opacity: 1, rotateY: 0 }
          }
          transition={lrTransition}
          style={{ transformOrigin: "left center" }}
          aria-hidden
        >
          <FoilVines variant="tl" />
          <FoilVines variant="bl" />
        </motion.div>

        {/* Right flap */}
        <motion.div
          className="petal-flap petal-flap--right"
          initial={false}
          animate={
            flapsOpen
              ? { x: "112%", opacity: 0.1, rotateY: -42 }
              : { x: "0%", opacity: 1, rotateY: 0 }
          }
          transition={lrTransition}
          style={{ transformOrigin: "right center" }}
          aria-hidden
        >
          <FoilVines variant="tr" />
          <FoilVines variant="br" />
        </motion.div>

        {/* Seal — two halves that split with L/R flaps */}
        <div className="petal-seal" aria-hidden>
          <motion.div
            className="petal-seal__half petal-seal__half--left"
            initial={false}
            animate={
              sealSplit || (flapsOpen && reduceMotion)
                ? { x: "-58vw", opacity: 0, rotate: -18 }
                : { x: 0, opacity: 1, rotate: 0 }
            }
            transition={sealHalfTransition}
          >
            <div className="petal-seal__clip petal-seal__clip--left">
              <GoldSealMark initials={cover.initials} />
            </div>
          </motion.div>
          <motion.div
            className="petal-seal__half petal-seal__half--right"
            initial={false}
            animate={
              sealSplit || (flapsOpen && reduceMotion)
                ? { x: "58vw", opacity: 0, rotate: 18 }
                : { x: 0, opacity: 1, rotate: 0 }
            }
            transition={sealHalfTransition}
          >
            <div className="petal-seal__clip petal-seal__clip--right">
              <GoldSealMark initials={cover.initials} />
            </div>
          </motion.div>
        </div>

        {isIdle && (
          <button
            type="button"
            className="petal-hit"
            onPointerUp={onTap}
            onClick={onTap}
            aria-label={`${cover.ctaLabel} para abrir la invitación`}
          />
        )}

        {isIdle && (
          <p className="petal-hint" aria-hidden>
            {cover.ctaLabel}
          </p>
        )}
      </div>

      {/* Hidden SVG defs for foil stroke used by FoilVines */}
      <svg width="0" height="0" aria-hidden className="petal-defs">
        <defs>
          <linearGradient id="foilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8d48a" />
            <stop offset="50%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#8a6414" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
