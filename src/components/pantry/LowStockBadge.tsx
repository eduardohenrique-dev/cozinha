"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Tag } from "@/components/ui/Tag";

export function LowStockBadge({ zerado }: { zerado?: boolean }) {
  const dot = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tw = gsap.to(dot.current, {
      scale: 1.35,
      opacity: 0.55,
      duration: 1.1,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    return () => {
      tw.kill();
    };
  }, []);

  return (
    <Tag tone={zerado ? "danger" : "warn"}>
      <span ref={dot} className={`inline-block h-1.5 w-1.5 rounded-full ${zerado ? "bg-danger" : "bg-warn"}`} />
      {zerado ? "acabou" : "baixo"}
    </Tag>
  );
}
