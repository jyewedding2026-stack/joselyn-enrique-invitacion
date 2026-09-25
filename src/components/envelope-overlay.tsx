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

const EASE: [number, number, number, number] = [0.33, 0.1, 0.25, 1];
/** Soft gravity — gentle settle, no bounce */
const EASE_GRAVITY: [number, number, number, number] = [0.45, 0.05, 0.55, 0.95];
const EASE_SOFT: [number, number, number, number] = [0.4, 0.0, 0.2, 1];
const EXIT_MS = 480;

/** Absolute timeline from tap (ms) — subtler untie, same order */
const T = {
  knotEnd: 420,
  bowStart: 420,
  bowEnd: 1300,
  ribbonStart: 950,
  ribbonEnd: 1450,
  pauseEnd: 1650,
  openEnd: 2650,
  handoff: 2850,
} as const;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Soft photoreal satin bow — subtle fabric unwrap (option 2).
 * Separate knot / loops / tips; gentle staggered fall, no theatrical punch.
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
    : { duration: 0.42, ease: EASE };

  const knotFall: Transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.95, ease: EASE_SOFT, times: [0, 0.3, 0.62, 1] };

  const loopFall: Transition = reduceMotion
    ? { duration: 0.12 }
    : {
        delay: 0.22,
        duration: 0.72,
        ease: EASE_SOFT,
        times: [0, 0.35, 0.7, 1],
      };

  const tipFall: Transition = reduceMotion
    ? { duration: 0.15 }
    : {
        duration: 1.05,
        ease: EASE_GRAVITY,
        times: [0, 0.2, 0.45, 0.72, 1],
      };

  return (
    <div className="lazo" aria-hidden>
      <svg className="lazo__svg" viewBox="0 0 280 210" focusable="false">
        <defs>
          <linearGradient id="lazoSatin" x1="10%" y1="5%" x2="90%" y2="95%">
            <stop offset="0%" stopColor="#fbfbfc" />
            <stop offset="22%" stopColor="#eef0f4" />
            <stop offset="48%" stopColor="#d5d8e0" />
            <stop offset="72%" stopColor="#b9bdc8" />
            <stop offset="100%" stopColor="#9aa0ac" />
          </linearGradient>
          <linearGradient id="lazoSatinDeep" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e4e6ec" />
            <stop offset="50%" stopColor="#c0c4ce" />
            <stop offset="100%" stopColor="#8b909c" />
          </linearGradient>
          <linearGradient id="lazoTipFace" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#fafafb" />
            <stop offset="30%" stopColor="#e6e8ee" />
            <stop offset="65%" stopColor="#c2c6d0" />
            <stop offset="100%" stopColor="#9a9fad" />
          </linearGradient>
          <linearGradient id="lazoTipSide" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b4b8c2" />
            <stop offset="55%" stopColor="#8e939f" />
            <stop offset="100%" stopColor="#747986" />
          </linearGradient>
          <radialGradient id="lazoKnotLit" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#e8eaf0" stopOpacity="0.35" />
            <stop offset="75%" stopColor="#b8bcc6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#7a7e88" stopOpacity="0.38" />
          </radialGradient>
          <linearGradient id="lazoSpec" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="45%" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <filter id="lazoDrop" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b" />
            <feOffset dy="1.5" result="o" />
            <feFlood floodColor="#4a4e58" floodOpacity="0.16" />
            <feComposite in2="o" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="lazoInner" x="-12%" y="-12%" width="124%" height="124%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>

        {/* Left tip — soft ribbon strip, gentle fall */}
        <motion.g
          className="lazo__tip lazo__tip--left"
          style={{ transformOrigin: "128px 88px" }}
          initial={false}
          animate={
            released
              ? {
                  x: [0, -3, -8, -14, -18],
                  y: [0, 10, 32, 68, 98],
                  rotate: [0, -5, -11, -16, -20],
                  opacity: [1, 1, 1, 0.85, 0.35],
                }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={tipFall}
        >
          <path
            d="M126 86 C110 96 92 118 74 146 L76 154 C96 132 114 108 130 94 Z"
            fill="url(#lazoTipSide)"
            opacity="0.55"
          />
          <path
            d="M130 84
               C110 92 88 116 64 148
               L76 160
               L88 146
               L100 160
               L112 144
               C120 120 128 100 136 88 Z"
            fill="url(#lazoTipFace)"
            filter="url(#lazoDrop)"
          />
          <path
            d="M124 92 C108 108 92 128 78 148"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.32"
          />
        </motion.g>

        <motion.g
          className="lazo__tip lazo__tip--right"
          style={{ transformOrigin: "152px 88px" }}
          initial={false}
          animate={
            released
              ? {
                  x: [0, 3, 8, 14, 18],
                  y: [0, 12, 34, 72, 102],
                  rotate: [0, 4, 10, 15, 18],
                  opacity: [1, 1, 1, 0.85, 0.35],
                }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={{
            ...tipFall,
            delay: reduceMotion ? 0 : 0.06,
          }}
        >
          <path
            d="M154 86 C170 96 188 118 206 146 L204 154 C184 132 166 108 150 94 Z"
            fill="url(#lazoTipSide)"
            opacity="0.55"
          />
          <path
            d="M150 84
               C170 92 192 116 216 148
               L204 160
               L192 146
               L180 160
               L168 144
               C160 120 152 100 144 88 Z"
            fill="url(#lazoTipFace)"
            filter="url(#lazoDrop)"
          />
          <path
            d="M156 92 C172 108 188 128 202 148"
            fill="none"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.32"
          />
        </motion.g>

        {/* Left loop — soft collapse */}
        <motion.g
          className="lazo__loop lazo__loop--left"
          style={{ transformOrigin: "122px 70px" }}
          initial={false}
          animate={
            loopsFalling
              ? {
                  x: [0, -6, -14, -22],
                  y: [0, 4, 18, 36],
                  rotate: [0, -4, -10, -14],
                  scale: [1, 0.99, 0.96, 0.94],
                  opacity: [1, 1, 0.9, 0.4],
                }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={loopFall}
        >
          <path
            d="M132 72 C102 36 52 38 34 60 C20 80 52 96 116 82 Z"
            fill="#8a8e98"
            opacity="0.16"
            filter="url(#lazoInner)"
          />
          <path
            d="M134 70 C100 28 46 30 28 54 C14 76 50 96 118 80 Z"
            fill="url(#lazoSatin)"
            filter="url(#lazoDrop)"
          />
          <path
            d="M118 70 C94 48 66 48 48 60 C56 70 82 74 110 74 Z"
            fill="url(#lazoSatinDeep)"
            opacity="0.28"
          />
          <path
            d="M102 44 C78 34 56 36 42 48"
            fill="none"
            stroke="url(#lazoSpec)"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </motion.g>

        <motion.g
          className="lazo__loop lazo__loop--right"
          style={{ transformOrigin: "158px 70px" }}
          initial={false}
          animate={
            loopsFalling
              ? {
                  x: [0, 6, 14, 22],
                  y: [0, 5, 20, 38],
                  rotate: [0, 4, 10, 14],
                  scale: [1, 0.99, 0.96, 0.94],
                  opacity: [1, 1, 0.9, 0.4],
                }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={{
            ...loopFall,
            delay: reduceMotion ? 0 : 0.26,
          }}
        >
          <path
            d="M148 72 C178 36 228 38 246 60 C260 80 228 96 164 82 Z"
            fill="#8a8e98"
            opacity="0.16"
            filter="url(#lazoInner)"
          />
          <path
            d="M146 70 C180 28 234 30 252 54 C266 76 230 96 162 80 Z"
            fill="url(#lazoSatin)"
            filter="url(#lazoDrop)"
          />
          <path
            d="M162 70 C186 48 214 48 232 60 C224 70 198 74 170 74 Z"
            fill="url(#lazoSatinDeep)"
            opacity="0.28"
          />
          <path
            d="M178 44 C202 34 224 36 238 48"
            fill="none"
            stroke="url(#lazoSpec)"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </motion.g>

        {/* Knot — soft tension, quiet settle */}
        <motion.g
          className="lazo__knot"
          style={{ transformOrigin: "140px 74px" }}
          initial={false}
          animate={
            released
              ? {
                  y: [0, 6, 24, 52],
                  x: [0, 1, 2, 3],
                  rotate: [0, 2, 6, 8],
                  scale: [1, 0.99, 0.96, 0.93],
                  opacity: [1, 1, 0.8, 0.32],
                }
              : knotActive
                ? {
                    scale: [1, 1.04, 0.98, 1.01, 1],
                    y: [0, -0.6, 0.4, 0, 0],
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
            cy="76"
            rx="24"
            ry="17"
            fill="url(#lazoSatinDeep)"
            opacity="0.65"
          />
          <ellipse
            cx="140"
            cy="72"
            rx="22"
            ry="17"
            fill="url(#lazoSatin)"
            filter="url(#lazoDrop)"
          />
          <ellipse cx="140" cy="72" rx="22" ry="17" fill="url(#lazoKnotLit)" />
          <path
            d="M126 66 C134 60 146 60 154 66 C148 70 132 70 126 66"
            fill="#fff"
            opacity="0.22"
          />
          <ellipse cx="134" cy="67" rx="5" ry="3" fill="#fff" opacity="0.28" />
          <path
            d="M128 78 C136 84 144 84 152 78"
            fill="none"
            stroke="#6a6e78"
            strokeWidth="1.1"
            opacity="0.18"
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
        duration: 0.7,
        ease: EASE_SOFT,
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
                      x: ["0%", "18%", "42%", "58%"],
                      y: [0, 10, 28, 44],
                      rotate: [0, 3, 8, 10],
                      opacity: [1, 1, 0.75, 0.3],
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
