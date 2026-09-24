"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { wedding } from "@/content/wedding";

type EnvelopeOverlayProps = {
  open: boolean;
  onOpen: () => void;
};

/**
 * Mandatory welcome sequence:
 * TAP → animateKnot (0–300) → releaseBow (300–900) → releaseRibbon (700–1200)
 * → wait (1200–1400) → openCard (1400–2400) → onOpen().
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
const EASE_FALL: [number, number, number, number] = [0.33, 0.1, 0.25, 1];
const EXIT_MS = 480;

/** Absolute timeline from tap (ms) */
const T = {
  knotEnd: 300,
  bowStart: 300,
  bowEnd: 900,
  ribbonStart: 700,
  ribbonEnd: 1200,
  pauseEnd: 1400,
  openEnd: 2400,
  handoff: 2600,
} as const;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function BowParts({
  knotActive,
  released,
  reduceMotion,
}: {
  knotActive: boolean;
  released: boolean;
  reduceMotion: boolean | null;
}) {
  const loopTransition: Transition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.55, ease: EASE_FALL, delay: 0.05 };
  const tailTransition: Transition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.6, ease: EASE_FALL };
  const knotTransition: Transition = reduceMotion
    ? { duration: 0.1 }
    : { duration: 0.3, ease: EASE };

  return (
    <div className="lazo" aria-hidden>
      <svg className="lazo__svg" viewBox="0 0 200 120" focusable="false">
        <defs>
          <linearGradient id="lazoSatin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="28%" stopColor="#e8e9ed" />
            <stop offset="55%" stopColor="#c8cad2" />
            <stop offset="100%" stopColor="#9a9eaa" />
          </linearGradient>
          <linearGradient id="lazoDeep" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#dfe1e8" />
            <stop offset="100%" stopColor="#7a7e8a" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "88px 48px" }}
          animate={
            released
              ? { x: -28, y: 56, rotate: -38, opacity: 0.12, scale: 0.92 }
              : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
          }
          transition={loopTransition}
        >
          <path
            d="M96 46 C68 8 28 12 20 34 C12 56 44 68 88 54 Z"
            fill="url(#lazoSatin)"
          />
          <path
            d="M72 30 C58 22 40 24 32 32"
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "112px 48px" }}
          animate={
            released
              ? { x: 28, y: 56, rotate: 38, opacity: 0.12, scale: 0.92 }
              : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
          }
          transition={loopTransition}
        >
          <path
            d="M104 46 C132 8 172 12 180 34 C188 56 156 68 112 54 Z"
            fill="url(#lazoSatin)"
          />
          <path
            d="M128 30 C142 22 160 24 168 32"
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.55"
          />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "92px 52px" }}
          animate={
            released
              ? { x: -18, y: 78, rotate: -52, opacity: 0.08 }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={tailTransition}
        >
          <path
            d="M90 52 C66 62 42 84 30 108 L58 98 C70 80 84 62 96 54 Z"
            fill="url(#lazoDeep)"
          />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "108px 52px" }}
          animate={
            released
              ? { x: 18, y: 78, rotate: 52, opacity: 0.08 }
              : { x: 0, y: 0, rotate: 0, opacity: 1 }
          }
          transition={tailTransition}
        >
          <path
            d="M110 52 C134 62 158 84 170 108 L142 98 C130 80 116 62 104 54 Z"
            fill="url(#lazoDeep)"
          />
        </motion.g>

        <motion.g
          style={{ transformOrigin: "100px 48px" }}
          animate={
            released
              ? { y: 64, scale: 0.7, opacity: 0.1, rotate: 12 }
              : knotActive
                ? { y: 0, scale: [1, 1.12, 0.94, 1], opacity: 1, rotate: 0 }
                : { y: 0, scale: 1, opacity: 1, rotate: 0 }
          }
          transition={
            released
              ? tailTransition
              : knotActive
                ? knotTransition
                : { duration: 0.2 }
          }
        >
          <ellipse cx="100" cy="48" rx="16" ry="13" fill="url(#lazoSatin)" />
          <ellipse
            cx="100"
            cy="47"
            rx="9"
            ry="7"
            fill="#6e727a"
            opacity="0.28"
          />
          <ellipse
            cx="96"
            cy="44"
            rx="4"
            ry="2.5"
            fill="#fff"
            opacity="0.45"
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
    // Bow motion runs 300–900; we return after full bow window from call site
  }, []);

  const releaseRibbon = useCallback(async () => {
    setPhase("ribbon");
    setRibbonReleased(true);
    // Ribbon motion runs 700–1200; wait handled by sequence
  }, []);

  const openCard = useCallback(async () => {
    // HARD RULE: only called after ribbon cleared + pause
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

    // 0–300: knot tension
    await animateKnot();
    if (!alive()) return;

    // 300: start bow fall
    await releaseBow();
    if (!alive()) return;

    // 300→700: bow falling alone
    await wait(T.ribbonStart - T.bowStart);
    if (!alive()) return;

    // 700: ribbon physical release (overlaps remaining bow to 900)
    await releaseRibbon();
    if (!alive()) return;

    // 700→1200: ribbon slides/falls clear of center
    await wait(T.ribbonEnd - T.ribbonStart);
    if (!alive()) return;

    // 1200–1400: pause — center clear before openCard
    setPhase("pause");
    await wait(T.pauseEnd - T.ribbonEnd);
    if (!alive()) return;

    // 1400–2400: leaves open in 3D (NEVER before this gate)
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
    : { duration: 0.5, ease: EASE_FALL };

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

          {/* Independent ribbon — physical slide/fall */}
          <div className="ribbon-slot" aria-hidden>
            <motion.div
              className="ribbon-wrap"
              initial={false}
              animate={
                ribbonReleased
                  ? { x: "78%", y: 56, rotate: 16, opacity: 0.18 }
                  : { x: 0, y: 0, rotate: 0, opacity: 1 }
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
