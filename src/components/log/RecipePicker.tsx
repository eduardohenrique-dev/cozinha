"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { EmptyPhotoArt } from "@/components/illustrations";
import { fmtNum, normalizar } from "@/lib/format";
import { cx } from "@/lib/cx";
import type { ReceitaParaConsumo } from "@/lib/recipes";

export function RecipePicker({
  receitas,
  value,
  onChange,
}: {
  receitas: ReceitaParaConsumo[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const [busca, setBusca] = useState("");
  const lista = useMemo(() => {
    const nb = normalizar(busca);
    return receitas.filter((r) => !nb || normalizar(r.titulo).includes(nb) || r.tags.some((t) => normalizar(t).includes(nb)));
  }, [receitas, busca]);

  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Qual receita?"
          className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-base placeholder:text-text-faint focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
        />
      </label>
      <ul className="max-h-[22rem] space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {lista.map((r) => {
          const sel = r.id === value;
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onChange(r.id)}
                className={cx(
                  "flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition-[border-color,background-color,box-shadow] duration-300 ease-organic",
                  sel ? "border-primary bg-primary-soft/60 shadow-soft" : "border-transparent bg-surface hover:border-line",
                )}
              >
                <span className="h-14 w-16 shrink-0 overflow-hidden rounded-[12px_4px_12px_4px] bg-bg">
                  {r.thumbUrl ? <img src={r.thumbUrl} alt="" className="h-full w-full object-cover" /> : <EmptyPhotoArt />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.titulo}</span>
                  <span className="block text-sm text-text-muted">
                    {fmtNum(Math.round(r.kcalPorcao))} kcal / porção
                    {r.itens === 0 ? (
                      <span className="text-text-faint"> · sem ingredientes</span>
                    ) : r.faltando > 0 ? (
                      <span className="text-text-faint">
                        {" "}· faltam {r.faltando} {r.faltando === 1 ? "item" : "itens"}
                      </span>
                    ) : (
                      <span className="text-text-faint"> · dá para {fmtNum(r.porcoesPossiveis, 1)}</span>
                    )}
                  </span>
                </span>
                <span
                  className={cx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                    sel ? "border-primary bg-primary text-text" : "border-line text-transparent",
                  )}
                >
                  <Check size={14} />
                </span>
              </button>
            </li>
          );
        })}
        {lista.length === 0 && <li className="py-6 text-center text-sm text-text-muted">Nenhuma receita com esse nome.</li>}
      </ul>
    </div>
  );
}
