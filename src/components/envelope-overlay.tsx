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
 * Elegant cover: staggered reveal → gold J&E seal → slow bifold L/R → onOpen().
 */
type Phase = "idle" | "sealing" | "opening" | "revealed" | "exiting";

const EASE_SOFT: [number, number, number, number] = [0.22, 0.8, 0.28, 1];
const EASE_OPEN: [number, number, number, number] = [0.33, 0.05, 0.25, 1];
const EXIT_MS = 480;

const T = {
  sealPress: 380,
  openDuration: 1800,
  settle: 280,
} as const;

/** Stagger delays (s) for cover entrance */
const STAGGER = {
  phrase: 0.12,
  names: 0.32,
  meta: 0.52,
  seal: 0.78,
  cta: 1.05,
} as const;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function GoldSeal({
  pressed,
  initials,
}: {
  pressed: boolean;
  initials: string;
}) {
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

      <motion.g
        filter="url(#goldSoft)"
        animate={
          pressed
            ? { scale: 0.92, opacity: 0.4 }
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
        <text
          x="60"
          y="67"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="22"
          fontWeight="600"
          letterSpacing="0.06em"
          fill="#3d2a08"
          opacity="0.55"
        >
          {initials}
        </text>
        <text
          x="60"
          y="64.5"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="22"
          fontWeight="600"
          letterSpacing="0.06em"
          fill="#fff1c2"
          opacity="0.92"
        >
          {initials}
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
  const [coverReady, setCoverReady] = useState(false);
  const lockRef = useRef(false);
  const runIdRef = useRef(0);
  const abortRef = useRef(false);

  const cover = wedding.cover;
  const placeLine =
    cover.placeLine ||
    `${wedding.ceremony.city} · ${wedding.ceremony.place}`;

  const resetMotion = useCallback(() => {
    setSealPressed(false);
    setLeavesOpen(false);
    setCoverReady(false);
  }, []);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("idle");
      lockRef.current = false;
      abortRef.current = false;
      resetMotion();
      const t = window.setTimeout(
        () => setCoverReady(true),
        reduceMotion ? 0 : 40,
      );
      return () => window.clearTimeout(t);
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
  }, [open, mounted, resetMotion, reduceMotion]);

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

    setPhase("sealing");
    setSealPressed(true);
    await wait(T.sealPress);
    if (!alive()) return;

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
  const showCover = !leavesOpen;
  const cardShown = leavesOpen || (reduceMotion && phase !== "idle");
  const showSeal =
    phase === "idle" || phase === "sealing" || phase === "opening";
  const isIdle = phase === "idle";

  const leafTransition: Transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: T.openDuration / 1000, ease: EASE_OPEN };

  const sealExit: Transition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.85, ease: EASE_SOFT, delay: 0.12 };

  const itemHidden = { opacity: 0, y: 26 };
  const itemShown = { opacity: 1, y: 0 };
  const itemTransition = (delay: number): Transition =>
    reduceMotion
      ? { duration: 0.01 }
      : { duration: 0.85, ease: EASE_SOFT, delay };

  const sealEntrance = reduceMotion
    ? { opacity: 1, scale: 1, rotate: 0 }
    : coverReady
      ? { opacity: 1, scale: 1, rotate: 0 }
      : { opacity: 0, scale: 0.82, rotate: -8 };

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
              <p className="invitation-card__eyebrow">{cover.welcomePhrase}</p>
              <h2 className="invitation-card__names">
                {wedding.couple.displayName}
              </h2>
              <span className="invitation-card__rule" aria-hidden />
              <p className="invitation-card__date">{wedding.date.display}</p>
              <p className="invitation-card__place">{cover.placeLine}</p>
            </motion.div>
          </div>

          {/* Elegant staggered cover (idle face) */}
          <motion.div
            className="cover-face"
            initial={false}
            animate={{ opacity: showCover ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0.08 : 0.22 }}
            aria-hidden={!showCover}
          >
            <motion.p
              className="cover-face__phrase"
              initial={itemHidden}
              animate={coverReady ? itemShown : itemHidden}
              transition={itemTransition(STAGGER.phrase)}
            >
              {cover.welcomePhrase}
            </motion.p>

            <motion.h1
              className="cover-face__names"
              initial={itemHidden}
              animate={coverReady ? itemShown : itemHidden}
              transition={itemTransition(STAGGER.names)}
            >
              {wedding.couple.displayName}
            </motion.h1>

            <motion.p
              className="cover-face__meta"
              initial={itemHidden}
              animate={coverReady ? itemShown : itemHidden}
              transition={itemTransition(STAGGER.meta)}
            >
              <span>{wedding.date.display}</span>
              <span className="cover-face__meta-dot" aria-hidden>
                ·
              </span>
              <span>{placeLine}</span>
            </motion.p>

            {showSeal && (
              <motion.div
                className="cover-face__seal"
                initial={sealEntrance}
                animate={
                  leavesOpen
                    ? { opacity: 0, scale: 0.85, y: 8, rotate: 0 }
                    : coverReady
                      ? { opacity: 1, scale: 1, rotate: 0, y: 0 }
                      : sealEntrance
                }
                transition={
                  leavesOpen
                    ? sealExit
                    : reduceMotion
                      ? { duration: 0.01 }
                      : {
                          duration: 0.85,
                          ease: EASE_SOFT,
                          delay: STAGGER.seal,
                        }
                }
              >
                <motion.div
                  className={`gold-seal__pulse ${
                    isIdle && !reduceMotion ? "gold-seal__pulse--live" : ""
                  }`}
                  whileHover={
                    isIdle && !reduceMotion ? { scale: 1.06 } : undefined
                  }
                  whileTap={
                    isIdle && !reduceMotion ? { scale: 0.96 } : undefined
                  }
                >
                  <GoldSeal
                    pressed={sealPressed}
                    initials={cover.initials}
                  />
                </motion.div>
              </motion.div>
            )}

            {isIdle && (
              <motion.div
                className="cover-face__cta-wrap"
                initial={itemHidden}
                animate={coverReady ? itemShown : itemHidden}
                transition={itemTransition(STAGGER.cta)}
              >
                <button
                  type="button"
                  className="cover-cta"
                  onPointerUp={onTap}
                  onClick={onTap}
                  aria-label={cover.ctaLabel}
                >
                  <span className="cover-cta__label">{cover.ctaLabel}</span>
                  <span className="cover-cta__shimmer" aria-hidden />
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Left leaf — hinge on center */}
          <motion.div
            className="card-leaf card-leaf--left"
            initial={false}
            animate={{ rotateY: leavesOpen ? -102 : 0 }}
            transition={leafTransition}
            style={{
              transformOrigin: "right center",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transformPerspective: 1100,
            }}
            aria-hidden
          >
            <div className="card-leaf__face" />
          </motion.div>

          {/* Right leaf */}
          <motion.div
            className="card-leaf card-leaf--right"
            initial={false}
            animate={{ rotateY: leavesOpen ? 102 : 0 }}
            transition={leafTransition}
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              WebkitTransformStyle: "preserve-3d",
              transformPerspective: 1100,
            }}
            aria-hidden
          >
            <div className="card-leaf__face card-leaf__face--emboss" />
          </motion.div>

          {isIdle && (
            <button
              type="button"
              className="envelope-hit"
              onPointerUp={onTap}
              onClick={onTap}
              aria-label="Toca el sello para abrir la invitación"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
