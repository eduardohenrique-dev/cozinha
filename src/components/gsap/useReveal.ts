"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Revela filhos `[data-reveal]` ao entrarem na tela, com stagger orgânico. */
export function useReveal<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
    if (items.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 28, rotate: 0.4 });
      ScrollTrigger.batch(items, {
        start: "top 94%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            rotate: 0,
            duration: 0.95,
            ease: "power3.out",
            stagger: { each: 0.085, from: "start" },
          }),
      });
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
