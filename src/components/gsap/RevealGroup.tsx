"use client";

import type { ReactNode } from "react";
import { useReveal } from "./useReveal";

/** Contêiner que revela os filhos marcados com `data-reveal` ao rolar. */
export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
