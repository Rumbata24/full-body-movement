"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
}

async function triggerInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) return false;
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return choice.outcome === "accepted";
}

/** Wraps the browser's PWA install flow — a real one-tap prompt on
 * Android/Chrome/Edge, platform detection only on iOS (Safari exposes no
 * programmatic install trigger there). */
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    Promise.resolve().then(() => {
      setCanInstall(!!deferredPrompt);
      setIsIOS(/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window));
      setIsStandalone(standalone);
    });

    const unsubscribe = () => {
      Promise.resolve().then(() => setCanInstall(true));
    };
    listeners.add(unsubscribe);
    return () => {
      listeners.delete(unsubscribe);
    };
  }, []);

  return { canInstall, isIOS, isStandalone, promptInstall: triggerInstallPrompt };
}
