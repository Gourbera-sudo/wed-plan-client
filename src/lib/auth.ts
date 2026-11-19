"use client";

import { useSyncExternalStore } from "react";

/**
 * Demo session store.
 *
 * Auth is not wired to a backend yet, so the signed-in user is kept in
 * localStorage. Components subscribe through `useSession`, so the navbar (and
 * anything else) re-renders as soon as `signIn`/`signOut` runs, including
 * across tabs. Replace the internals here when a real auth provider lands.
 */

export type SessionUser = {
  name: string;
  email: string;
  image?: string | null;
};

const STORAGE_KEY = "wedplan:session";

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;
let storageListenerAttached = false;

function parseSession(raw: string | null): SessionUser | null {
  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<SessionUser> | null;
    if (!value || typeof value.name !== "string" || typeof value.email !== "string") {
      return null;
    }

    return {
      name: value.name,
      email: value.email,
      image: typeof value.image === "string" ? value.image : null,
    };
  } catch {
    return null;
  }
}

function readSession(): SessionUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode); fall back to memory.
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = parseSession(raw);
  }

  return cachedUser;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!storageListenerAttached && typeof window !== "undefined") {
    storageListenerAttached = true;
    window.addEventListener("storage", (event) => {
      // `null` key means storage was cleared from another tab.
      if (event.key === STORAGE_KEY || event.key === null) {
        readSession();
        emit();
      }
    });
  }

  return () => {
    listeners.delete(listener);
  };
}

function getServerSnapshot(): SessionUser | null {
  return null;
}

export function signIn(user: SessionUser) {
  const next: SessionUser = {
    name: user.name.trim(),
    email: user.email.trim(),
    image: user.image ?? null,
  };

  cachedRaw = JSON.stringify(next);
  cachedUser = next;

  try {
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // Keep the in-memory session so the UI still updates.
  }

  emit();
}

export function signOut() {
  cachedRaw = null;
  cachedUser = null;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up.
  }

  emit();
}

export function useSession(): SessionUser | null {
  return useSyncExternalStore(subscribe, readSession, getServerSnapshot);
}
