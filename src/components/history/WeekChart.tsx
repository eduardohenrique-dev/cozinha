"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { fmtDiaSemanaCurto, fmtDiaNumero, chaveDoDia } from "@/lib/date";
import { fmtNum } from "@/lib/format";
import type { DiaResumo } from "@/lib/day";

/**
 * Gráfico semanal em SVG próprio: barras de calorias com a meta como linha de
 * referência e a água desenhada como faixa embaixo. Sem lib de gráfico.
 */
export function WeekChart({
  dias,
  metaCalorica,
  metaAguaMl,
  selecionado,
  onSelecionar,
}: {
  dias: DiaResumo[];
  metaCalorica: number;
  metaAguaMl: number;
  selecionado?: string;
  onSelecionar?: (chave: string) => void;
}) {
  const grupo = useRef<SVGGElement>(null);

  const W = 640;
  const H = 240;
  const padX = 28;
  const padTop = 24;
  const alturaBarras = 140;
  const baseBarras = padTop + alturaBarras;
  const faixaAgua = 40;
  const baseAgua = baseBarras + 34;

  const teto = Math.max(metaCalorica * 1.15, ...dias.map((d) => d.kcal), 1);
  const larguraCol = (W - padX * 2) / Math.max(dias.length, 1);
  const larguraBarra = Math.min(38, larguraCol * 0.52);
  const yMeta = baseBarras - (metaCalorica / teto) * alturaBarras;

  useEffect(() => {
    if (!grupo.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const barras = gsap.utils.toArray<SVGRectElement>("[data-barra]");
      gsap.from(barras, {
        attr: { height: 0, y: baseBarras },
        duration: 0.9,
        ease: "power3.out",
        stagger: { each: 0.06, from: "start" },
      });
      gsap.from("[data-agua]", { scaleY: 0, transformOrigin: "bottom", duration: 0.7, ease: "back.out(1.6)", stagger: 0.05, delay: 0.15 });
    }, grupo);
    return () => ctx.revert();
  }, [dias, baseBarras]);

  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Calorias e água dos últimos dias">
        <g ref={grupo}>
          {/* meta de calorias */}
          <line x1={padX} y1={yMeta} x2={W - padX} y2={yMeta} stroke="rgb(var(--c-line))" strokeWidth="2" strokeDasharray="5 6" />
          <text x={W - padX} y={yMeta - 7} textAnchor="end" className="fill-[rgb(var(--c-text-faint))] text-[11px]">
            meta {fmtNum(metaCalorica)} kcal
          </text>

          {dias.map((d, i) => {
            const cx = padX + larguraCol * i + larguraCol / 2;
            const h = Math.max(2, (d.kcal / teto) * alturaBarras);
            const acima = d.kcal > metaCalorica;
            const ativo = selecionado === d.chave;
            const pctAgua = metaAguaMl > 0 ? Math.min(1, d.aguaMl / metaAguaMl) : 0;
            const hoje = chaveDoDia(new Date()) === d.chave;

            return (
              <g key={d.chave} className={onSelecionar ? "cursor-pointer" : undefined} onClick={() => onSelecionar?.(d.chave)}>
                {ativo && (
                  <rect
                    x={cx - larguraCol / 2 + 2}
                    y={padTop - 12}
                    width={larguraCol - 4}
                    height={H - padTop - 8}
                    rx="12"
                    fill="rgb(var(--c-primary-soft))"
                    opacity=".55"
                  />
                )}

                <rect
                  data-barra
                  x={cx - larguraBarra / 2}
                  y={baseBarras - h}
                  width={larguraBarra}
                  height={h}
                  rx={Math.min(8, larguraBarra / 2)}
                  fill={acima ? "rgb(var(--c-danger))" : "rgb(var(--c-accent))"}
                />

                {d.kcal > 0 && (
                  <text x={cx} y={baseBarras - h - 8} textAnchor="middle" className="fill-[rgb(var(--c-text-muted))] text-[11px]">
                    {fmtNum(Math.round(d.kcal))}
                  </text>
                )}

                {/* faixa de água */}
                <rect x={cx - larguraBarra / 2} y={baseAgua} width={larguraBarra} height={10} rx="5" fill="rgb(var(--c-line))" />
                <rect
                  data-agua
                  x={cx - larguraBarra / 2}
                  y={baseAgua}
                  width={Math.max(pctAgua * larguraBarra, pctAgua > 0 ? 4 : 0)}
                  height={10}
                  rx="5"
                  fill="rgb(var(--c-primary))"
                />

                <text x={cx} y={baseBarras + 20} textAnchor="middle" className="fill-[rgb(var(--c-text-muted))] text-[11px] uppercase">
                  {fmtDiaSemanaCurto(d.data)}
                </text>
                <text
                  x={cx}
                  y={baseAgua + 32}
                  textAnchor="middle"
                  className={hoje ? "fill-[rgb(var(--c-text))] text-[12px] font-semibold" : "fill-[rgb(var(--c-text-faint))] text-[12px]"}
                >
                  {fmtDiaNumero(d.data)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-center gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> calorias
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" /> acima da meta
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> água
        </span>
      </figcaption>
    </figure>
  );
}
