"use client";

import { useEffect } from "react";
import { useDay } from "@/store/day";

export function DayHydrator(p: { kcal: number; aguaMl: number; metaCalorica: number; metaAguaMl: number }) {
  const hidratar = useDay((s) => s.hidratar);
  useEffect(() => {
    hidratar(p);
  }, [p.kcal, p.aguaMl, p.metaCalorica, p.metaAguaMl, hidratar, p]);
  return null;
}
