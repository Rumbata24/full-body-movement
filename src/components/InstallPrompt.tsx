"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useInstallPrompt } from "@/lib/useInstallPrompt";
import { Share, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "install-prompt-dismissed";

export function InstallPrompt() {
  const { canInstall, isIOS, isStandalone, promptInstall } =
    useInstallPrompt();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    });
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  if (isStandalone || dismissed || (!canInstall && !isIOS)) return null;

  return (
    <Card className="flex items-start gap-3">
      <div className="flex-1">
        <p className="text-[15px] font-medium">Add to your home screen</p>
        <p className="mt-1 text-sm text-text-muted">
          {isIOS ? (
            <>
              Tap the <Share size={14} className="inline -mt-0.5" /> Share
              icon below, then &quot;Add to Home Screen&quot; for the full app
              experience.
            </>
          ) : (
            "Install this app for quick access and a full-screen, no-browser-bar experience."
          )}
        </p>
        {!isIOS && (
          <Button
            variant="secondary"
            className="mt-3"
            onClick={async () => {
              const accepted = await promptInstall();
              if (accepted) dismiss();
            }}
          >
            Add to Home Screen
          </Button>
        )}
      </div>
      <button
        onClick={dismiss}
        className="text-text-faint"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </Card>
  );
}
