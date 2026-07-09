"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { clsx } from "clsx";

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
      onClick={onCancel}
    >
      <Card
        raised
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-1.5 text-center"
      >
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold">
          {title}
        </p>
        {description && (
          <p className="text-sm text-text-muted">{description}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={clsx(
              "flex-1",
              destructive &&
                "!bg-high !shadow-[0_8px_24px_-8px_var(--color-high)]",
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
