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
 * Visuals from reference photo textures; tap seal → TB → LR split → onOpen().
 */
type Phase = "idle" | "opening" | "revealed" | "exiting";

const EASE_FLAP: [number, number, number, number] = [0.4, 0.02, 0.2, 1];
const EXIT_MS = 520;

const T = {
  press: 220,
  topBottom: 520,
  leftRightDelay: 280,
  leftRight: 780,
  revealHold: 720,
} as const;

/** Reference-matched assets (static export paths) */
const FLAP_TEXTURE = "./images/portada-flaps-texture.jpg";
const SEAL_TEXTURE = "./images/wax-seal-ref.webp";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function SealFace() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="petal-seal__img"
      src={SEAL_TEXTURE}
      alt=""
      draggable={false}
      decoding="async"
    />
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

  const flapStyle = {
    backgroundImage: `url(${FLAP_TEXTURE})`,
  } as const;

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
        <motion.div
          className="petal-flap petal-flap--top"
          initial={false}
          animate={
            flapsOpen
              ? { y: "-108%", opacity: 0.15, rotateX: -28 }
              : { y: "0%", opacity: 1, rotateX: 0 }
          }
          transition={tbTransition}
          style={{ transformOrigin: "center top", ...flapStyle }}
          aria-hidden
        />

        <motion.div
          className="petal-flap petal-flap--bottom"
          initial={false}
          animate={
            flapsOpen
              ? { y: "108%", opacity: 0.15, rotateX: 28 }
              : { y: "0%", opacity: 1, rotateX: 0 }
          }
          transition={tbTransition}
          style={{ transformOrigin: "center bottom", ...flapStyle }}
          aria-hidden
        />

        <motion.div
          className="petal-flap petal-flap--left"
          initial={false}
          animate={
            flapsOpen
              ? { x: "-112%", opacity: 0.1, rotateY: 42 }
              : { x: "0%", opacity: 1, rotateY: 0 }
          }
          transition={lrTransition}
          style={{ transformOrigin: "left center", ...flapStyle }}
          aria-hidden
        />

        <motion.div
          className="petal-flap petal-flap--right"
          initial={false}
          animate={
            flapsOpen
              ? { x: "112%", opacity: 0.1, rotateY: -42 }
              : { x: "0%", opacity: 1, rotateY: 0 }
          }
          transition={lrTransition}
          style={{ transformOrigin: "right center", ...flapStyle }}
          aria-hidden
        />
      </div>

      {/* Seal + hit sit outside the flap 3D stage so perspective never warps the wax. */}
      <div className="petal-seal" aria-hidden>
        <motion.div
          className="petal-seal__piece petal-seal__piece--left"
          initial={false}
          animate={
            sealSplit || (flapsOpen && reduceMotion)
              ? { x: "-42vw", opacity: 0, rotate: -12 }
              : { x: 0, opacity: 1, rotate: 0 }
          }
          transition={sealHalfTransition}
        >
          <SealFace />
        </motion.div>
        <motion.div
          className="petal-seal__piece petal-seal__piece--right"
          initial={false}
          animate={
            sealSplit || (flapsOpen && reduceMotion)
              ? { x: "42vw", opacity: 0, rotate: 12 }
              : { x: 0, opacity: 1, rotate: 0 }
          }
          transition={sealHalfTransition}
        >
          <SealFace />
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
    </motion.div>
  );
}
