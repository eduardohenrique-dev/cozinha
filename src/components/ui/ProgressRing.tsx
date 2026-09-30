"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { cx } from "@/lib/cx";

/** Anel de progresso em SVG puro; o preenchimento anima via stroke-dashoffset. */
export function ProgressRing({
  value,
  max,
  size = 176,
  stroke = 14,
  tone = "primary",
  children,
  className,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  tone?: "primary" | "accent";
  children?: ReactNode;
  className?: string;
}) {
  const ref = useRef<SVGCircleElement>(null);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const acima = max > 0 && value > max;

  useEffect(() => {
    gsap.to(ref.current, {
      strokeDashoffset: c * (1 - pct),
      duration: 1.5,
      ease: "expo.out",
      overwrite: true,
    });
  }, [pct, c]);

  const cor = acima ? "var(--danger)" : tone === "accent" ? "var(--accent)" : "var(--primary)";

  return (
    <div className={cx("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-line))" strokeWidth={stroke} />
        <circle
          ref={ref}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c}
          style={{ transition: "stroke 0.6s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
