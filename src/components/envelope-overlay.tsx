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
 * Satin bow: knot / loops / long V-tips with volume.
 * Fall uses staggered keyframes (fabric), not teleport + fade.
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
    : { duration: 0.7, ease: EASE_SOFT, times: [0, 0.25, 0.55, 1] };

  const loopFall: Transition = reduceMotion
    ? { duration: 0.12 }
    : {
        // loops ~200–700ms from tap
        delay: 0.2,
        duration: 0.5,
        ease: EASE_SOFT,
        times: [0, 0.35, 0.7, 1],
      };

  const tipFall: Transition = reduceMotion
    ? { duration: 0.15 }
    : {
        // tips 350–1100ms from tap
        duration: 0.75,
        ease: EASE_GRAVITY,
        times: [0, 0.18, 0.42, 0.68, 1],
      };

  return (
    <div className="lazo" aria-hidden>
      <svg className="lazo__svg" viewBox="0 0 240 170" focusable="false">
        <defs>
          <linearGradient id="lazoSatin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor="#f2f3f6" />
            <stop offset="48%" stopColor="#d0d3db" />
            <stop offset="72%" stopColor="#b4b8c2" />
            <stop offset="100%" stopColor="#8e929e" />
          </linearGradient>
          <linearGradient id="lazoSatinSide" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e6e8ee" />
            <stop offset="45%" stopColor="#c2c5ce" />
            <stop offset="100%" stopColor="#7c808c" />
          </linearGradient>
          <linearGradient id="lazoTip" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7f8fa" />
            <stop offset="40%" stopColor="#cfd2da" />
            <stop offset="100%" stopColor="#8a8e9a" />
          </linearGradient>
          <linearGradient id="lazoTipEdge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b8bcc6" />
            <stop offset="100%" stopColor="#6a6e7a" />
          </linearGradient>
          <radialGradient id="lazoKnotShade" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="45%" stopColor="#d8dae0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6e727c" stopOpacity="0.45" />
          </radialGradient>
          <filter id="lazoSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="b" />
            <feOffset dy="1.2" result="o" />
            <feFlood floodColor="#4a4e58" floodOpacity="0.22" />
            <feComposite in2="o" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Left tip — long V with thickness; gravity fall + sway */}
        <motion.g
          className="lazo__tip lazo__tip--left"
          style={{ transformOrigin: "108px 72px" }}
          initial={false}
          animate={
            released
              ? {
                  x: [0, -6, -14, -22, -28],
                  y: [0, 14, 42, 88, 128],
                  rotate: [0, -12, -22, -32, -38],
                  opacity: [1, 1, 1, 0.9, 0.2],
                }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={tipFall}
        >
          <path
            d="M108 70 C88 82 64 108 48 138 L72 146 C84 118 98 90 112 76 Z"
            fill="url(#lazoTipEdge)"
            opacity="0.85"
          />
          <path
            d="M110 68 C86 78 58 102 42 134 L46 142 L70 132 C82 106 98 84 114 72 Z"
            fill="url(#lazoTip)"
            filter="url(#lazoSoft)"
          />
          <path d="M42 134 L54 128 L46 142 Z" fill="#9a9eaa" />
          <path
            d="M102 74 C86 86 68 108 54 128"
            fill="none"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.45"
          />
        </motion.g>

        {/* Right tip */}
        <motion.g
          className="lazo__tip lazo__tip--right"
          style={{ transformOrigin: "132px 72px" }}
          initial={false}
          animate={
            released
              ? {
                  x: [0, 6, 14, 22, 28],
                  y: [0, 16, 46, 92, 132],
                  rotate: [0, 10, 20, 30, 36],
                  opacity: [1, 1, 1, 0.9, 0.2],
                }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={{
            ...tipFall,
            delay: reduceMotion ? 0 : 0.04,
          }}
        >
          <path
            d="M132 70 C152 82 176 108 192 138 L168 146 C156 118 142 90 128 76 Z"
            fill="url(#lazoTipEdge)"
            opacity="0.85"
          />
          <path
            d="M130 68 C154 78 182 102 198 134 L194 142 L170 132 C158 106 142 84 126 72 Z"
            fill="url(#lazoTip)"
            filter="url(#lazoSoft)"
          />
          <path d="M198 134 L186 128 L194 142 Z" fill="#9a9eaa" />
          <path
            d="M138 74 C154 86 172 108 186 128"
            fill="none"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.45"
          />
        </motion.g>

        {/* Left loop — soft collapse outward/down */}
        <motion.g
          className="lazo__loop lazo__loop--left"
          style={{ transformOrigin: "104px 58px" }}
          initial={false}
          animate={
            loopsFalling
              ? {
                  x: [0, -10, -22, -30],
                  y: [0, 6, 28, 52],
                  rotate: [0, -8, -18, -26],
                  scale: [1, 0.98, 0.94, 0.9],
                  opacity: [1, 1, 0.95, 0.25],
                }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={loopFall}
        >
          <path
            d="M112 58 C86 22 42 24 28 48 C16 70 48 86 100 68 Z"
            fill="#8a8e98"
            opacity="0.35"
          />
          <path
            d="M114 56 C84 16 36 18 24 44 C12 68 46 84 102 66 Z"
            fill="url(#lazoSatin)"
            filter="url(#lazoSoft)"
          />
          <path
            d="M100 58 C78 42 52 40 36 50"
            fill="none"
            stroke="#6e727c"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.22"
          />
          <path
            d="M88 40 C70 30 50 32 38 42"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.55"
          />
        </motion.g>

        {/* Right loop */}
        <motion.g
          className="lazo__loop lazo__loop--right"
          style={{ transformOrigin: "136px 58px" }}
          initial={false}
          animate={
            loopsFalling
              ? {
                  x: [0, 10, 22, 30],
                  y: [0, 8, 30, 54],
                  rotate: [0, 8, 18, 26],
                  scale: [1, 0.98, 0.94, 0.9],
                  opacity: [1, 1, 0.95, 0.25],
                }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={{
            ...loopFall,
            delay: reduceMotion ? 0 : 0.24,
          }}
        >
          <path
            d="M128 58 C154 22 198 24 212 48 C224 70 192 86 140 68 Z"
            fill="#8a8e98"
            opacity="0.35"
          />
          <path
            d="M126 56 C156 16 204 18 216 44 C228 68 194 84 138 66 Z"
            fill="url(#lazoSatin)"
            filter="url(#lazoSoft)"
          />
          <path
            d="M140 58 C162 42 188 40 204 50"
            fill="none"
            stroke="#6e727c"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.22"
          />
          <path
            d="M152 40 C170 30 190 32 202 42"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.55"
          />
        </motion.g>

        {/* Knot — tension then loosen; fall last */}
        <motion.g
          className="lazo__knot"
          style={{ transformOrigin: "120px 60px" }}
          initial={false}
          animate={
            released
              ? {
                  y: [0, 10, 36, 72],
                  x: [0, 2, 4, 6],
                  rotate: [0, 6, 14, 18],
                  scale: [1, 0.96, 0.88, 0.82],
                  opacity: [1, 1, 0.85, 0.18],
                }
              : knotActive
                ? {
                    scale: [1, 1.1, 0.96, 1.02, 1],
                    y: [0, -1, 1, 0, 0],
                    opacity: 1,
                    rotate: 0,
                    x: 0,
                  }
                : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={released ? knotFall : knotTension}
        >
          <ellipse
            cx="120"
            cy="62"
            rx="20"
            ry="15"
            fill="url(#lazoSatinSide)"
            opacity="0.9"
          />
          <ellipse cx="120" cy="58" rx="18" ry="14" fill="url(#lazoSatin)" />
          <ellipse
            cx="120"
            cy="58"
            rx="18"
            ry="14"
            fill="url(#lazoKnotShade)"
          />
          <path
            d="M108 52 C114 48 126 48 132 52 C128 56 112 56 108 52"
            fill="#fff"
            opacity="0.35"
          />
          <ellipse cx="114" cy="54" rx="5" ry="3.2" fill="#fff" opacity="0.5" />
          <path
            d="M112 64 C118 68 122 68 128 64"
            fill="none"
            stroke="#5c606a"
            strokeWidth="1.2"
            opacity="0.3"
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
