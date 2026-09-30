"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

/** Entrada suave de um bloco (cabeçalhos, painéis). Respeita prefers-reduced-motion. */
export function Appear({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { y: 18, opacity: 0, duration: 0.9, ease: "power4.out", delay });
    });
    return () => ctx.revert();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
