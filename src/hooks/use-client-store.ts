"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import {
  getPassById,
  loadPasses,
  loadRsvps,
  type DigitalPass,
  type RsvpEntry,
} from "@/lib/storage";

const RSVP_EVENT = "boda-rsvp-changed";
const PASS_EVENT = "boda-pass-changed";
const EMPTY_RSVPS: RsvpEntry[] = [];
const EMPTY_PASSES: DigitalPass[] = [];

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

export function useRsvps(): RsvpEntry[] {
  return useSyncExternalStore(
    subscribeFactory(RSVP_EVENT),
    loadRsvps,
    () => EMPTY_RSVPS
  );
}

export function usePasses(): DigitalPass[] {
  return useSyncExternalStore(
    subscribeFactory(PASS_EVENT),
    loadPasses,
    () => EMPTY_PASSES
  );
}

export function usePassById(id: string | undefined): DigitalPass | null {
  const cacheRef = useRef<{ id?: string; pass: DigitalPass | null }>({
    pass: null,
  });

  const getSnapshot = useCallback(() => {
    if (!id) {
      cacheRef.current = { id, pass: null };
      return null;
    }
    const found = getPassById(id) ?? null;
    const prev = cacheRef.current;
    if (
      prev.id === id &&
      prev.pass?.id === found?.id &&
      prev.pass?.familyName === found?.familyName &&
      prev.pass?.guestCount === found?.guestCount
    ) {
      return prev.pass;
    }
    cacheRef.current = { id, pass: found };
    return found;
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
