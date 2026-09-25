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
 * Welcome: closed bifold + golden J&E seal.
 * Tap seal → seal softens → leaves open slowly L/R → onOpen() to main invite.
 */
type Phase = "idle" | "sealing" | "opening" | "revealed" | "exiting";

const EASE_SOFT: [number, number, number, number] = [0.22, 0.8, 0.28, 1];
const EASE_OPEN: [number, number, number, number] = [0.33, 0.05, 0.25, 1];
const EXIT_MS = 480;

/** Timeline from tap (ms) */
const T = {
  sealPress: 380,
  openDuration: 1650,
  settle: 280,
} as const;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Golden wax-style seal with J & E */
function GoldSeal({ pressed }: { pressed: boolean }) {
  return (
    <svg
      className="gold-seal__svg"
      viewBox="0 0 120 120"
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="goldWax" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#f5e6b8" />
          <stop offset="28%" stopColor="#e0c56a" />
          <stop offset="55%" stopColor="#c9a227" />
          <stop offset="78%" stopColor="#a67c1a" />
          <stop offset="100%" stopColor="#7a5810" />
        </radialGradient>
        <radialGradient id="goldRim" cx="50%" cy="50%" r="50%">
          <stop offset="72%" stopColor="#b8891f" stopOpacity="0" />
          <stop offset="88%" stopColor="#8a6414" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5c420c" stopOpacity="0.75" />
        </radialGradient>
        <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.55" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#6b4a0c" stopOpacity="0.25" />
        </linearGradient>
        <filter id="goldSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b" />
          <feOffset dy="1.2" result="o" />
          <feFlood floodColor="#4a3208" floodOpacity="0.35" />
          <feComposite in2="o" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Scalloped wax edge */}
      <motion.g
        filter="url(#goldSoft)"
        animate={
          pressed
            ? { scale: 0.92, opacity: 0.35 }
            : { scale: 1, opacity: 1 }
        }
        style={{ transformOrigin: "60px 60px" }}
        transition={{ duration: 0.38, ease: EASE_SOFT }}
      >
        <circle cx="60" cy="60" r="52" fill="url(#goldWax)" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#8a6414"
          strokeWidth="1.2"
          opacity="0.45"
        />
        {/* soft scallop nubs */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = 60 + Math.cos(rad) * 50;
          const y = 60 + Math.sin(rad) * 50;
          return (
            <circle
              key={deg}
              cx={x}
              cy={y}
              r="6.5"
              fill="url(#goldWax)"
              opacity="0.95"
            />
          );
        })}
        <circle cx="60" cy="60" r="52" fill="url(#goldRim)" />
        <circle cx="60" cy="60" r="44" fill="url(#goldWax)" />
        <circle cx="60" cy="60" r="44" fill="url(#goldSheen)" />
        {/* inner ring */}
        <circle
          cx="60"
          cy="60"
          r="36"
          fill="none"
          stroke="#f0d878"
          strokeWidth="1.1"
          opacity="0.55"
        />
        <circle
          cx="60"
          cy="60"
          r="33"
          fill="none"
          stroke="#8a6414"
          strokeWidth="0.8"
          opacity="0.35"
        />
        {/* Initials — deep stamp + light highlight for readable J & E */}
        <text
          x="60"
          y="67"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="24"
          fontWeight="600"
          letterSpacing="0.06em"
          fill="#3d2a08"
          opacity="0.55"
        >
          J &amp; E
        </text>
        <text
          x="60"
          y="64.5"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="24"
          fontWeight="600"
          letterSpacing="0.06em"
          fill="#fff1c2"
          opacity="0.92"
        >
          J &amp; E
        </text>
      </motion.g>
    </svg>
  );
}

export function EnvelopeOverlay({ open, onOpen }: EnvelopeOverlayProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sealPressed, setSealPressed] = useState(false);
  const [leavesOpen, setLeavesOpen] = useState(false);
  const lockRef = useRef(false);
  const runIdRef = useRef(0);
  const abortRef = useRef(false);

  const resetMotion = useCallback(() => {
    setSealPressed(false);
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
      setSealPressed(true);
      setLeavesOpen(true);
      setPhase("opening");
      await wait(180);
      if (!alive()) return;
      setPhase("revealed");
      await wait(160);
      if (!alive()) return;
      window.scrollTo(0, 0);
      onOpen();
      return;
    }

    // Soft seal press
    setPhase("sealing");
    setSealPressed(true);
    await wait(T.sealPress);
    if (!alive()) return;

    // Slow realistic bifold open
    setPhase("opening");
    setLeavesOpen(true);
    await wait(T.openDuration);
    if (!alive()) return;

    setPhase("revealed");
    await wait(T.settle);
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
  const showClosedCopy = !leavesOpen;
  const cardShown = leavesOpen || (reduceMotion && phase !== "idle");
  const showSeal = phase === "idle" || phase === "sealing" || phase === "opening";

  const leafTransition: Transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: T.openDuration / 1000, ease: EASE_OPEN };

  const sealExit: Transition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.85, ease: EASE_SOFT, delay: 0.12 };

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
                  : { duration: 0.7, ease: EASE_SOFT, delay: 0.45 }
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
            transition={{ duration: reduceMotion ? 0.08 : 0.35 }}
            aria-hidden
          >
            <p className="envelope-closed-names">
              {wedding.couple.displayName}
            </p>
          </motion.div>

          {/* Left leaf — hinge on center */}
          <motion.div
            className="card-leaf card-leaf--left"
            initial={false}
            animate={{ rotateY: leavesOpen ? -128 : 0 }}
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

          {/* Right leaf */}
          <motion.div
            className="card-leaf card-leaf--right"
            initial={false}
            animate={{ rotateY: leavesOpen ? 128 : 0 }}
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

          {/* Golden J & E seal */}
          {showSeal && (
            <motion.div
              className="gold-seal"
              initial={false}
              animate={
                leavesOpen
                  ? { opacity: 0, scale: 0.85, x: "-50%", y: "calc(-50% + 8px)" }
                  : { opacity: 1, scale: 1, x: "-50%", y: "-50%" }
              }
              transition={sealExit}
              aria-hidden
            >
              <GoldSeal pressed={sealPressed} />
            </motion.div>
          )}

          {phase === "idle" && (
            <button
              type="button"
              className="envelope-hit"
              onPointerUp={onTap}
              onClick={onTap}
              aria-label="Toca el sello para abrir la invitación"
            />
          )}

          {phase === "idle" && (
            <p className="envelope-tap-hint" aria-hidden>
              Toca el sello para abrir
            </p>
          )}
        </div>

        {phase === "idle" && (
          <p className="envelope-hint">Toca el sello para abrir</p>
        )}
      </div>
    </motion.div>
  );
}
