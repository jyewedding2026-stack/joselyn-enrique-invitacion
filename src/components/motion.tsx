"use client";

import type { ReactNode } from "react";

/** Lightweight enter motion via CSS (no framer-motion bundle). */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`invite-fade-in ${className ?? ""}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export function HeroMotion({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`invite-fade-in ${className ?? ""}`}>{children}</div>;
}
