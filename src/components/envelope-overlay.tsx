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
 * Sequence (unchanged order):
 * TAP → animateKnot → releaseBow (tips fall) → releaseRibbon → wait → openCard → onOpen
 * HARD RULE: openCard never starts before lazo+cinta clear center + pause.
 */
type Phase =
  | "idle"
  | "knot"
  | "bow"
  | "ribbon"
  | "pause"
  | "opening"
  | "revealed"
  | "exiting";

const EASE: [number, number, number, number] = [0.25, 1, 0.5, 1];
/** Soft gravity — accelerate down, no bounce */
const EASE_GRAVITY: [number, number, number, number] = [0.4, 0.0, 0.7, 0.2];
const EASE_SOFT: [number, number, number, number] = [0.33, 0.05, 0.45, 1];
const EXIT_MS = 480;

/** Absolute timeline from tap (ms) — tips fall 350–1100 before ribbon clears */
const T = {
  knotEnd: 350,
  bowStart: 350,
  bowEnd: 1100,
  ribbonStart: 800,
  ribbonEnd: 1300,
  pauseEnd: 1500,
  openEnd: 2500,
  handoff: 2700,
} as const;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Large premium satin bow (~60% card width via CSS).
 * Separate knot / loops / long V-tips; staggered fabric fall keyframes.
 */
function BowParts({
  knotActive,
  released,
  reduceMotion,
}: {
  knotActive: boolean;
  released: boolean;
  reduceMotion: boolean | null;
}) {
  const loopsFalling = knotActive || released;

  const knotTension: Transition = reduceMotion
    ? { duration: 0.1 }
    : { duration: 0.35, ease: EASE };

  const knotFall: Transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.75, ease: EASE_SOFT, times: [0, 0.28, 0.58, 1] };

  const loopFall: Transition = reduceMotion
    ? { duration: 0.12 }
    : {
        delay: 0.18,
        duration: 0.55,
        ease: EASE_SOFT,
        times: [0, 0.3, 0.65, 1],
      };

  const tipFall: Transition = reduceMotion
    ? { duration: 0.15 }
    : {
        duration: 0.8,
        ease: EASE_GRAVITY,
        times: [0, 0.16, 0.4, 0.68, 1],
      };

  return (
    <div className="lazo" aria-hidden>
      <svg className="lazo__svg" viewBox="0 0 280 210" focusable="false">
        <defs>
          <linearGradient id="lazoSatin" x1="8%" y1="0%" x2="92%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="#f7f8fb" />
            <stop offset="38%" stopColor="#dde0e8" />
            <stop offset="55%" stopColor="#c5c9d4" />
            <stop offset="78%" stopColor="#a8adb8" />
            <stop offset="100%" stopColor="#8a8f9c" />
          </linearGradient>
          <linearGradient id="lazoSatinDeep" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8eaf0" />
            <stop offset="40%" stopColor="#b4b8c4" />
            <stop offset="100%" stopColor="#6e7380" />
          </linearGradient>
          <linearGradient id="lazoTipFace" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#eef0f5" />
            <stop offset="55%" stopColor="#c8ccd6" />
            <stop offset="100%" stopColor="#9196a4" />
          </linearGradient>
          <linearGradient id="lazoTipSide" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a0a4b0" />
            <stop offset="50%" stopColor="#7a7e8a" />
            <stop offset="100%" stopColor="#5c606c" />
          </linearGradient>
          <radialGradient id="lazoKnotLit" cx="32%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#e4e6ec" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#aeb2bc" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5a5e6a" stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id="lazoSpec" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="40%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="lazoDrop" x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="b" />
            <feOffset dy="2" result="o" />
            <feFlood floodColor="#3a3e48" floodOpacity="0.28" />
            <feComposite in2="o" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="lazoInner" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        <motion.g
          className="lazo__tip lazo__tip--left"
          style={{ transformOrigin: "128px 88px" }}
          initial={false}
          animate={
            released
              ? {
                  x: [0, -8, -16, -26, -34],
                  y: [0, 18, 52, 105, 148],
                  rotate: [0, -10, -20, -30, -36],
                  opacity: [1, 1, 1, 0.92, 0.18],
                }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={tipFall}
        >
          <path
            d="M126 86 C108 98 88 122 68 152 L68 162 C92 138 112 112 130 96 Z"
            fill="url(#lazoTipSide)"
            opacity="0.75"
          />
          <path
            d="M130 82 C108 92 84 118 58 154 L72 168 L86 152 L100 168 L112 148 C120 122 128 100 136 88 Z"
            fill="url(#lazoTipFace)"
            filter="url(#lazoDrop)"
          />
          <path
            d="M124 90 C104 108 86 132 70 156"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M128 94 C110 112 94 134 80 154"
            fill="none"
            stroke="#6a6e7a"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.28"
          />
        </motion.g>

        <motion.g
          className="lazo__tip lazo__tip--right"
          style={{ transformOrigin: "152px 88px" }}
          initial={false}
          animate={
            released
              ? {
                  x: [0, 8, 16, 26, 34],
                  y: [0, 20, 56, 110, 152],
                  rotate: [0, 9, 18, 28, 34],
                  opacity: [1, 1, 1, 0.92, 0.18],
                }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={{
            ...tipFall,
            delay: reduceMotion ? 0 : 0.05,
          }}
        >
          <path
            d="M154 86 C172 98 192 122 212 152 L212 162 C188 138 168 112 150 96 Z"
            fill="url(#lazoTipSide)"
            opacity="0.75"
          />
          <path
            d="M150 82 C172 92 196 118 222 154 L208 168 L194 152 L180 168 L168 148 C160 122 152 100 144 88 Z"
            fill="url(#lazoTipFace)"
            filter="url(#lazoDrop)"
          />
          <path
            d="M156 90 C176 108 194 132 210 156"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M152 94 C170 112 186 134 200 154"
            fill="none"
            stroke="#6a6e7a"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.28"
          />
        </motion.g>

        <motion.g
          className="lazo__loop lazo__loop--left"
          style={{ transformOrigin: "122px 70px" }}
          initial={false}
          animate={
            loopsFalling
              ? {
                  x: [0, -14, -28, -40],
                  y: [0, 8, 34, 62],
                  rotate: [0, -10, -20, -28],
                  scale: [1, 0.98, 0.93, 0.88],
                  opacity: [1, 1, 0.96, 0.22],
                }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={loopFall}
        >
          <path
            d="M132 72 C98 28 42 30 24 58 C8 84 48 104 118 84 Z"
            fill="#6e7280"
            opacity="0.28"
            filter="url(#lazoInner)"
          />
          <path
            d="M136 68 C96 18 34 20 16 52 C0 80 44 102 122 80 Z"
            fill="url(#lazoSatin)"
            filter="url(#lazoDrop)"
          />
          <path
            d="M120 70 C92 42 58 42 38 58 C48 72 78 78 112 76 Z"
            fill="url(#lazoSatinDeep)"
            opacity="0.45"
          />
          <path
            d="M100 42 C72 28 46 32 30 46"
            fill="none"
            stroke="url(#lazoSpec)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M118 66 C90 48 58 48 36 60"
            fill="none"
            stroke="#5c606c"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.2"
          />
        </motion.g>

        <motion.g
          className="lazo__loop lazo__loop--right"
          style={{ transformOrigin: "158px 70px" }}
          initial={false}
          animate={
            loopsFalling
              ? {
                  x: [0, 14, 28, 40],
                  y: [0, 10, 36, 64],
                  rotate: [0, 10, 20, 28],
                  scale: [1, 0.98, 0.93, 0.88],
                  opacity: [1, 1, 0.96, 0.22],
                }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={{
            ...loopFall,
            delay: reduceMotion ? 0 : 0.22,
          }}
        >
          <path
            d="M148 72 C182 28 238 30 256 58 C272 84 232 104 162 84 Z"
            fill="#6e7280"
            opacity="0.28"
            filter="url(#lazoInner)"
          />
          <path
            d="M144 68 C184 18 246 20 264 52 C280 80 236 102 158 80 Z"
            fill="url(#lazoSatin)"
            filter="url(#lazoDrop)"
          />
          <path
            d="M160 70 C188 42 222 42 242 58 C232 72 202 78 168 76 Z"
            fill="url(#lazoSatinDeep)"
            opacity="0.45"
          />
          <path
            d="M180 42 C208 28 234 32 250 46"
            fill="none"
            stroke="url(#lazoSpec)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M162 66 C190 48 222 48 244 60"
            fill="none"
            stroke="#5c606c"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.2"
          />
        </motion.g>

        <motion.g
          className="lazo__knot"
          style={{ transformOrigin: "140px 74px" }}
          initial={false}
          animate={
            released
              ? {
                  y: [0, 12, 42, 86],
                  x: [0, 3, 5, 8],
                  rotate: [0, 5, 12, 16],
                  scale: [1, 0.97, 0.9, 0.84],
                  opacity: [1, 1, 0.88, 0.16],
                }
              : knotActive
                ? {
                    scale: [1, 1.12, 0.95, 1.03, 1],
                    y: [0, -1.5, 1, 0, 0],
                    opacity: 1,
                    rotate: 0,
                    x: 0,
                  }
                : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={released ? knotFall : knotTension}
        >
          <ellipse
            cx="140"
            cy="78"
            rx="28"
            ry="20"
            fill="url(#lazoSatinDeep)"
            opacity="0.85"
          />
          <ellipse
            cx="140"
            cy="72"
            rx="26"
            ry="20"
            fill="url(#lazoSatin)"
            filter="url(#lazoDrop)"
          />
          <ellipse cx="140" cy="72" rx="26" ry="20" fill="url(#lazoKnotLit)" />
          <path
            d="M122 64 C132 56 148 56 158 64 C152 70 128 70 122 64"
            fill="#fff"
            opacity="0.4"
          />
          <ellipse cx="132" cy="66" rx="7" ry="4.5" fill="#fff" opacity="0.55" />
          <path
            d="M124 80 C134 88 146 88 156 80"
            fill="none"
            stroke="#4a4e58"
            strokeWidth="1.6"
            opacity="0.28"
          />
          <path
            d="M126 68 C134 74 146 74 154 68"
            fill="none"
            stroke="#fff"
            strokeWidth="1.4"
            opacity="0.35"
          />
        </motion.g>
      </svg>
    </div>
  );
}

export function EnvelopeOverlay({ open, onOpen }: EnvelopeOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<Phase>("idle");
  const [bowReleased, setBowReleased] = useState(false);
  const [ribbonReleased, setRibbonReleased] = useState(false);
  const [leavesOpen, setLeavesOpen] = useState(false);
  const lockRef = useRef(false);
  const runIdRef = useRef(0);
  const abortRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const resetMotion = useCallback(() => {
    setBowReleased(false);
    setRibbonReleased(false);
    setLeavesOpen(false);
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
    clearTimers();
    setPhase("exiting");
    const t = window.setTimeout(() => {
      setMounted(false);
      setPhase("idle");
      resetMotion();
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open, mounted, clearTimers, resetMotion]);

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

  const animateKnot = useCallback(async () => {
    setPhase("knot");
    await wait(T.knotEnd);
  }, []);

  const releaseBow = useCallback(async () => {
    setPhase("bow");
    setBowReleased(true);
  }, []);

  const releaseRibbon = useCallback(async () => {
    setPhase("ribbon");
    setRibbonReleased(true);
  }, []);

  const openCard = useCallback(async () => {
    setPhase("opening");
    setLeavesOpen(true);
    await wait(T.openEnd - T.pauseEnd);
  }, []);

  const startOpeningSequence = useCallback(async () => {
    if (phase !== "idle" || !open || lockRef.current) return;
    lockRef.current = true;
    abortRef.current = false;
    clearTimers();
    const runId = ++runIdRef.current;

    const alive = () =>
      !abortRef.current && runIdRef.current === runId && open;

    if (reduceMotion) {
      setBowReleased(true);
      setRibbonReleased(true);
      setLeavesOpen(true);
      setPhase("opening");
      await wait(160);
      if (!alive()) return;
      setPhase("revealed");
      await wait(200);
      if (!alive()) return;
      window.scrollTo(0, 0);
      onOpen();
      return;
    }

    await animateKnot();
    if (!alive()) return;

    await releaseBow();
    if (!alive()) return;

    // Tips falling; wait until ribbon start (tips clear center)
    await wait(T.ribbonStart - T.bowStart);
    if (!alive()) return;

    await releaseRibbon();
    if (!alive()) return;

    await wait(T.ribbonEnd - T.ribbonStart);
    if (!alive()) return;

    setPhase("pause");
    await wait(T.pauseEnd - T.ribbonEnd);
    if (!alive()) return;

    await openCard();
    if (!alive()) return;

    setPhase("revealed");
    await wait(T.handoff - T.openEnd);
    if (!alive()) return;

    window.scrollTo(0, 0);
    onOpen();
  }, [
    animateKnot,
    clearTimers,
    open,
    onOpen,
    openCard,
    phase,
    reduceMotion,
    releaseBow,
    releaseRibbon,
  ]);

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
  const knotActive = phase === "knot";
  const showClosedCopy = !leavesOpen;
  const cardShown = leavesOpen || (reduceMotion && phase !== "idle");

  const leafTransition: Transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 1, ease: EASE };

  const ribbonTransition: Transition = reduceMotion
    ? { duration: 0.12 }
    : {
        duration: 0.55,
        ease: EASE_GRAVITY,
        times: [0, 0.35, 0.7, 1],
      };

  return (
    <motion.div
      className={`envelope-overlay ${isExiting ? "envelope-overlay--exit" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Abrir invitación"
      aria-busy={phase !== "idle" && phase !== "revealed" && phase !== "exiting"}
      data-phase={phase}
      initial={false}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: EXIT_MS / 1000, ease: "easeOut" }}
    >
      <div className="envelope-scene">
        <div
          className={`envelope ${leavesOpen ? "envelope--open" : ""} ${
            phase !== "idle" ? "envelope--sequencing" : ""
          }`}
        >
          <div className="envelope-glow" aria-hidden />

          <div className="invitation-card" aria-hidden={!cardShown}>
            <motion.div
              className="invitation-card__inner"
              initial={false}
              animate={{ opacity: cardShown ? 1 : 0 }}
              transition={
                reduceMotion
                  ? { duration: 0.12 }
                  : { duration: 0.55, ease: EASE, delay: 0.2 }
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

          <motion.div
            className="envelope-closed-face"
            initial={false}
            animate={{ opacity: showClosedCopy ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0.08 : 0.25 }}
            aria-hidden
          >
            <p className="envelope-closed-names">
              {wedding.couple.displayName}
            </p>
            <p className="envelope-closed-initials">J&amp;E</p>
          </motion.div>

          <motion.div
            className="card-leaf card-leaf--left"
            initial={false}
            animate={{ rotateY: leavesOpen ? -118 : 0 }}
            transition={leafTransition}
            style={{
              transformOrigin: "right center",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
            }}
            aria-hidden
          >
            <div className="card-leaf__face" />
          </motion.div>

          <motion.div
            className="card-leaf card-leaf--right"
            initial={false}
            animate={{ rotateY: leavesOpen ? 118 : 0 }}
            transition={leafTransition}
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
            }}
            aria-hidden
          >
            <div className="card-leaf__face card-leaf__face--emboss" />
          </motion.div>

          <div className="ribbon-slot" aria-hidden>
            <motion.div
              className="ribbon-wrap"
              initial={false}
              animate={
                ribbonReleased
                  ? {
                      x: ["0%", "28%", "62%", "82%"],
                      y: [0, 18, 48, 72],
                      rotate: [0, 6, 14, 18],
                      opacity: [1, 1, 0.7, 0.15],
                    }
                  : { x: "0%", y: 0, rotate: 0, opacity: 1 }
              }
              transition={ribbonTransition}
            >
              <div className="ribbon-band ribbon-band--full" />
            </motion.div>
          </div>

          <div className="lazo-anchor" aria-hidden>
            <BowParts
              knotActive={knotActive}
              released={bowReleased}
              reduceMotion={reduceMotion}
            />
          </div>

          {phase === "idle" && (
            <button
              type="button"
              className="envelope-hit"
              onPointerUp={onTap}
              onClick={onTap}
              aria-label="Desatar el lazo y abrir la invitación"
            />
          )}

          {phase === "idle" && (
            <p className="envelope-tap-hint" aria-hidden>
              Toca para abrir
            </p>
          )}
        </div>

        {phase === "idle" && (
          <p className="envelope-hint">Toca el lazo para abrir</p>
        )}
      </div>
    </motion.div>
  );
}
