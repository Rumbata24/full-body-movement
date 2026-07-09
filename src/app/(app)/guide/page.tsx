"use client";

import { SkillBlueprintContent } from "@/components/SkillBlueprintContent";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <header className="flex items-center gap-3">
        <Link
          href="/log"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-raised text-text-muted transition-colors active:scale-[0.96]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            The Skill Blueprint
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">
            How to structure hard-skill training
          </p>
        </div>
      </header>

      <SkillBlueprintContent />
    </div>
  );
}
