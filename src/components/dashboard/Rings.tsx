"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { MacroBars } from "./MacroBars";
import { fmtNum } from "@/lib/format";
import { useDay } from "@/store/day";

function Ticker({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const atual = useRef(0);

  useEffect(() => {
    const obj = { v: atual.current };
    const tw = gsap.to(obj, {
      v: value,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        atual.current = obj.v;
        if (ref.current) ref.current.textContent = fmtNum(Math.round(obj.v));
      },
    });
    return () => {
      tw.kill();
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {fmtNum(0)}
    </span>
  );
}

export function Rings({ proteina, carboidrato, gordura }: { proteina: number; carboidrato: number; gordura: number }) {
  const { kcal, metaCalorica, aguaMl, metaAguaMl } = useDay();
  const restamKcal = metaCalorica - kcal;
  const restamAgua = metaAguaMl - aguaMl;

  return (
    <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-around">
      <div className="flex flex-col items-center gap-4">
        <ProgressRing value={kcal} max={metaCalorica} tone="accent" size={208} stroke={16}>
          <Ticker value={kcal} className="num-display text-5xl" />
          <span className="mt-1 text-xs uppercase tracking-wide text-text-muted">kcal</span>
          <span className="mt-1 text-xs text-text-faint">de {fmtNum(metaCalorica)}</span>
        </ProgressRing>
        <p className="text-sm text-text-muted">
          {restamKcal > 0 ? (
            <>
              Restam <span className="font-medium text-text">{fmtNum(Math.round(restamKcal))} kcal</span>
            </>
          ) : restamKcal === 0 ? (
            "Meta batida na medida."
          ) : (
            <span className="text-danger-strong">{fmtNum(Math.round(-restamKcal))} kcal acima da meta</span>
          )}
        </p>
        <MacroBars proteina={proteina} carboidrato={carboidrato} gordura={gordura} />
      </div>

      <div className="flex flex-col items-center gap-4">
        <ProgressRing value={aguaMl} max={metaAguaMl} size={160} stroke={13}>
          <Ticker value={aguaMl} className="num-display text-4xl" />
          <span className="mt-1 text-xs uppercase tracking-wide text-text-muted">ml</span>
          <span className="mt-1 text-xs text-text-faint">de {fmtNum(metaAguaMl)}</span>
        </ProgressRing>
        <p className="text-sm text-text-muted">
          {restamAgua > 0 ? (
            <>
              Faltam <span className="font-medium text-text">{fmtNum(restamAgua)} ml</span>
            </>
          ) : (
            "Hidratação em dia."
          )}
        </p>
      </div>
    </div>
  );
}
