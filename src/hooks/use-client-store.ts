"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getPassById,
  loadPasses,
  loadRsvps,
  type DigitalPass,
  type RsvpEntry,
} from "@/lib/storage";

const RSVP_EVENT = "boda-rsvp-changed";
const PASS_EVENT = "boda-pass-changed";

function subscribeFactory(eventName: string) {
  return (onStoreChange: () => void) => {
    if (typeof window === "undefined") return () => {};
    const handler = () => onStoreChange();
    window.addEventListener(eventName, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(eventName, handler);
      window.removeEventListener("storage", handler);
    };
  };
}

export function notifyRsvpChanged() {
  window.dispatchEvent(new Event(RSVP_EVENT));
}

export function notifyPassChanged() {
  window.dispatchEvent(new Event(PASS_EVENT));
}

export function useRsvps(): RsvpEntry[] {
  return useSyncExternalStore(
    subscribeFactory(RSVP_EVENT),
    loadRsvps,
    () => []
  );
}

export function usePasses(): DigitalPass[] {
  return useSyncExternalStore(
    subscribeFactory(PASS_EVENT),
    loadPasses,
    () => []
  );
}

export function usePassById(id: string | undefined): DigitalPass | null {
  const getSnapshot = useCallback(() => {
    if (!id) return null;
    return getPassById(id) ?? null;
  }, [id]);

  return useSyncExternalStore(
    subscribeFactory(PASS_EVENT),
    getSnapshot,
    () => null
  );
}

export function useOrigin(): string {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
}
