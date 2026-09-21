"use client";

import { useSyncExternalStore } from "react";
import { wedding } from "@/content/wedding";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function subscribe(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
}

function getNow() {
  return Date.now();
}

export function Countdown() {
  const now = useSyncExternalStore(subscribe, getNow, () => 0);
  const target = new Date(`${wedding.date.iso}T17:00:00-05:00`).getTime();

  if (!now) {
    return (
      <div className="mt-6 grid grid-cols-4 gap-2 text-center text-white/90 sm:max-w-md">
        {["Días", "Horas", "Min", "Seg"].map((label) => (
          <div
            key={label}
            className="rounded-lg bg-black/20 px-2 py-3 backdrop-blur-sm"
          >
            <p className="font-[family-name:var(--font-display)] text-2xl tabular-nums">
              —
            </p>
            <p className="mt-1 text-[10px] tracking-[0.16em] uppercase opacity-80">
              {label}
            </p>
          </div>
        ))}
      </div>
    );
  }

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const parts = [
    { label: "Días", value: String(days) },
    { label: "Horas", value: pad(hours) },
    { label: "Min", value: pad(mins) },
    { label: "Seg", value: pad(secs) },
  ];

  return (
    <div className="mt-6">
      <p className="font-[family-name:var(--font-display)] text-lg italic text-white/90">
        Faltan
      </p>
      <div className="mt-2 grid grid-cols-4 gap-2 text-center text-white sm:max-w-md">
        {parts.map((part) => (
          <div
            key={part.label}
            className="rounded-lg bg-black/25 px-2 py-3 backdrop-blur-sm"
          >
            <p className="font-[family-name:var(--font-display)] text-2xl tabular-nums sm:text-3xl">
              {part.value}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.16em] text-white/75 uppercase">
              {part.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
