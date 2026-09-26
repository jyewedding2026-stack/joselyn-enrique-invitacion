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

/** Embossed floral/leaf relief — same sage tone, pressed-paper alto relieve */
function EmbossedFlorals({
  variant,
  uid,
}: {
  variant: "tl" | "tr" | "bl" | "br";
  uid: string;
}) {
  const transforms: Record<typeof variant, string> = {
    tl: "",
    tr: "scale(-1 1) translate(-100 0)",
    bl: "scale(1 -1) translate(0 -100)",
    br: "scale(-1 -1) translate(-100 -100)",
  };
  const filterId = `embossRelief-${uid}`;
  return (
    <svg
      className="petal-emboss"
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.6" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="2.4"
            specularConstant="0.85"
            specularExponent="18"
            lightingColor="#d8e0c8"
            result="spec"
          >
            <fePointLight x="-20" y="-40" z="48" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="lit" />
          <feComposite
            in="SourceGraphic"
            in2="lit"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="0.55"
            k4="0"
          />
        </filter>
      </defs>
      <g transform={transforms[variant]} filter={`url(#${filterId})`}>
        <g
          fill="none"
          stroke="#9aa688"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.72"
        >
          <path d="M8 16 C22 26 30 42 28 60 C26 76 18 88 10 96" />
          <path d="M16 18 C32 28 40 46 42 64 C43 76 38 86 32 94" />
          <path d="M24 20 C38 24 50 36 54 50" />
          <path d="M20 36 C34 34 46 42 50 54" />
          <path d="M18 50 C30 48 40 56 42 68" />
          <path d="M30 22 C38 16 48 18 54 26" />
          <path d="M28 38 C36 32 46 36 50 44" />
        </g>
        <g
          fill="none"
          stroke="#3e4636"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
          transform="translate(0.7 0.85)"
        >
          <path d="M8 16 C22 26 30 42 28 60 C26 76 18 88 10 96" />
          <path d="M16 18 C32 28 40 46 42 64 C43 76 38 86 32 94" />
          <path d="M24 20 C38 24 50 36 54 50" />
          <path d="M20 36 C34 34 46 42 50 54" />
          <path d="M18 50 C30 48 40 56 42 68" />
          <path d="M30 22 C38 16 48 18 54 26" />
          <path d="M28 38 C36 32 46 36 50 44" />
        </g>
        <g opacity="0.72">
          <ellipse
            cx="54"
            cy="24"
            rx="3.4"
            ry="4.8"
            fill="#7e8870"
            stroke="#a8b298"
            strokeWidth="0.55"
          />
          <ellipse
            cx="50"
            cy="42"
            rx="3"
            ry="4.3"
            fill="#727c64"
            stroke="#9aa688"
            strokeWidth="0.5"
          />
          <ellipse
            cx="44"
            cy="56"
            rx="2.7"
            ry="3.9"
            fill="#6a7460"
            stroke="#92a080"
            strokeWidth="0.45"
          />
          <ellipse
            cx="38"
            cy="70"
            rx="2.4"
            ry="3.5"
            fill="#646e58"
            stroke="#8a947c"
            strokeWidth="0.4"
          />
          <circle cx="54" cy="24" r="1.2" fill="#4e5844" opacity="0.65" />
          <circle cx="50" cy="42" r="1.05" fill="#485242" opacity="0.6" />
          <circle cx="34" cy="30" r="2.6" fill="#78846c" opacity="0.55" />
          <circle cx="37.5" cy="27.5" r="2" fill="#849076" opacity="0.5" />
          <circle cx="31.5" cy="27.5" r="1.8" fill="#6c7660" opacity="0.5" />
          <circle cx="34" cy="32.5" r="1.5" fill="#5e6854" opacity="0.45" />
        </g>
      </g>
    </svg>
  );
}

/** Realistic gold wax seal with letterpress cursive J & E */
function GoldSealMark({
  initials,
  uid,
}: {
  initials: string;
  uid: string;
}) {
  const wax = `petalWax-${uid}`;
  const rim = `waxRimShade-${uid}`;
  const sheen = `waxSheen-${uid}`;
  const depth = `sealDepth-${uid}`;
  const press = `letterpress-${uid}`;
  return (
    <svg
      className="petal-seal__svg"
      viewBox="0 0 120 120"
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id={wax} cx="34%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#f7e9b4" />
          <stop offset="22%" stopColor="#e4c45e" />
          <stop offset="48%" stopColor="#c9a227" />
          <stop offset="72%" stopColor="#9a7018" />
          <stop offset="100%" stopColor="#5c400c" />
        </radialGradient>
        <radialGradient id={rim} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#8a6414" stopOpacity="0" />
          <stop offset="88%" stopColor="#5c400c" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#3a2808" stopOpacity="0.7" />
        </radialGradient>
        <linearGradient id={sheen} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#fff8e0" stopOpacity="0.55" />
          <stop offset="35%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#4a3208" stopOpacity="0.28" />
        </linearGradient>
        <filter id={depth} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="b" />
          <feOffset dy="2" dx="0.5" result="o" />
          <feFlood floodColor="#2a1e06" floodOpacity="0.45" />
          <feComposite in2="o" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={press} x="-10%" y="-10%" width="120%" height="120%">
          <feOffset dx="0" dy="0.8" result="off" />
          <feGaussianBlur in="off" stdDeviation="0.35" result="blur" />
          <feFlood floodColor="#fff6d0" floodOpacity="0.55" result="light" />
          <feComposite in="light" in2="blur" operator="in" result="hi" />
          <feOffset dx="0" dy="-0.6" result="off2" />
          <feGaussianBlur in="off2" stdDeviation="0.3" result="blur2" />
          <feFlood floodColor="#3a2808" floodOpacity="0.65" result="dark" />
          <feComposite in="dark" in2="blur2" operator="in" result="sh" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="hi" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${depth})`}>
        {/* Irregular molten-wax silhouette */}
        <path
          d="M58 7
             C66 6.5 74 9 81 14
             C89 20 97 27 102 37
             C107 47 109 55 107 65
             C105 76 100 86 92 94
             C84 102 74 109 62 111
             C52 112.5 42 110 33 104
             C23 97 15 88 11 76
             C7 65 6.5 54 10 44
             C14 32 22 22 33 15
             C42 10 50 7.5 58 7 Z"
          fill={`url(#${wax})`}
        />
        {/* Asymmetric drip lobes */}
        <ellipse cx="72" cy="14" rx="7" ry="5.5" fill={`url(#${wax})`} transform="rotate(18 72 14)" />
        <ellipse cx="94" cy="28" rx="6.5" ry="5.2" fill={`url(#${wax})`} transform="rotate(42 94 28)" />
        <ellipse cx="105" cy="52" rx="5.8" ry="7" fill={`url(#${wax})`} transform="rotate(8 105 52)" />
        <ellipse cx="100" cy="78" rx="6.2" ry="5.5" fill={`url(#${wax})`} transform="rotate(-25 100 78)" />
        <ellipse cx="78" cy="102" rx="7.2" ry="5.2" fill={`url(#${wax})`} transform="rotate(-8 78 102)" />
        <ellipse cx="48" cy="106" rx="6.8" ry="5" fill={`url(#${wax})`} transform="rotate(12 48 106)" />
        <ellipse cx="22" cy="90" rx="6" ry="5.8" fill={`url(#${wax})`} transform="rotate(35 22 90)" />
        <ellipse cx="12" cy="62" rx="5.5" ry="7.2" fill={`url(#${wax})`} transform="rotate(-5 12 62)" />
        <ellipse cx="16" cy="36" rx="6.4" ry="5.4" fill={`url(#${wax})`} transform="rotate(-30 16 36)" />
        <ellipse cx="38" cy="16" rx="6.6" ry="5.2" fill={`url(#${wax})`} transform="rotate(22 38 16)" />
        <path
          d="M60 18
             C69 18.5 78 23 84 31
             C92 41 95 52 93 64
             C91 77 81 88 68 93
             C60 96 50 95 42 90
             C30 82 23 70 22 56
             C21 45 28 34 38 27
             C46 21 54 18 60 18 Z"
          fill={`url(#${wax})`}
        />
        <path
          d="M60 18
             C69 18.5 78 23 84 31
             C92 41 95 52 93 64
             C91 77 81 88 68 93
             C60 96 50 95 42 90
             C30 82 23 70 22 56
             C21 45 28 34 38 27
             C46 21 54 18 60 18 Z"
          fill={`url(#${rim})`}
        />
        <path
          d="M60 24
             C68 24.5 75 28 80 35
             C86 43 88 53 86 63
             C84 74 75 83 64 87
             C56 89 48 88 42 83
             C33 76 27 66 27 55
             C27 45 33 35 42 30
             C48 26 54 24 60 24 Z"
          fill={`url(#${sheen})`}
        />
        <circle
          cx="60"
          cy="60"
          r="29"
          fill="none"
          stroke="#5c400c"
          strokeWidth="1.5"
          opacity="0.4"
        />
        <circle
          cx="60"
          cy="60"
          r="27.2"
          fill="none"
          stroke="#f0d878"
          strokeWidth="0.65"
          opacity="0.32"
        />

        {/* Letterpress — deep sink */}
        <text
          x="60.6"
          y="70.2"
          textAnchor="middle"
          fontFamily="'Great Vibes', cursive"
          fontSize="36"
          fill="#1a1406"
          opacity="0.45"
        >
          {initials}
        </text>
        <text
          x="60"
          y="68.2"
          textAnchor="middle"
          fontFamily="'Great Vibes', cursive"
          fontSize="36"
          fill="#5a4010"
          opacity="0.95"
          filter={`url(#${press})`}
        >
          {initials}
        </text>
        <text
          x="59.4"
          y="66.8"
          textAnchor="middle"
          fontFamily="'Great Vibes', cursive"
          fontSize="36"
          fill="#e8d090"
          opacity="0.28"
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
          <EmbossedFlorals variant="tl" uid="top-tl" />
          <EmbossedFlorals variant="tr" uid="top-tr" />
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
          <EmbossedFlorals variant="bl" uid="bot-bl" />
          <EmbossedFlorals variant="br" uid="bot-br" />
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
          <EmbossedFlorals variant="tl" uid="left-tl" />
          <EmbossedFlorals variant="bl" uid="left-bl" />
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
          <EmbossedFlorals variant="tr" uid="right-tr" />
          <EmbossedFlorals variant="br" uid="right-br" />
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
              <GoldSealMark initials={cover.initials} uid="L" />
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
              <GoldSealMark initials={cover.initials} uid="R" />
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
    </motion.div>
  );
}
