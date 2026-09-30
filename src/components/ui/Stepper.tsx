"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "./Button";
import { fmtNum } from "@/lib/format";

export function Stepper({
  value,
  onChange,
  step = 0.5,
  min = 0.5,
  max = 20,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label: string;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v * 100) / 100)));
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={() => set(value - step)} disabled={value <= min} aria-label="Menos">
        <Minus size={18} />
      </Button>
      <div className="min-w-[5.5rem] text-center">
        <p className="num-display text-4xl leading-none">{fmtNum(value, 1)}</p>
        <p className="mt-1 text-xs text-text-muted">{label}</p>
      </div>
      <Button variant="outline" size="icon" onClick={() => set(value + step)} disabled={value >= max} aria-label="Mais">
        <Plus size={18} />
      </Button>
    </div>
  );
}
