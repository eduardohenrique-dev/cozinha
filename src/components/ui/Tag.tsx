import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type Tone = "sage" | "accent" | "warn" | "danger" | "neutral";

const tones: Record<Tone, string> = {
  sage: "bg-primary-soft text-primary-deep",
  accent: "bg-accent-soft text-accent-strong",
  warn: "bg-warn-soft text-text",
  danger: "bg-danger-soft text-danger-strong",
  neutral: "bg-bg text-text-muted",
};

export function Tag({ tone = "sage", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
