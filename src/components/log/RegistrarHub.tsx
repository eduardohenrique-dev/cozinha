"use client";

import { useState } from "react";
import { Droplets, UtensilsCrossed } from "lucide-react";
import { ConsumoForm } from "./ConsumoForm";
import { WaterPanel } from "./WaterPanel";
import { fmtNum } from "@/lib/format";
import { cx } from "@/lib/cx";
import { useDay } from "@/store/day";
import type { ReceitaParaConsumo } from "@/lib/recipes";
import type { IngredienteOpcao } from "@/lib/types";
import type { EntradaAgua } from "@/lib/day";

type Aba = "refeicao" | "agua";

export function RegistrarHub({
  receitas,
  ingredientes,
  agua,
  receitaInicial,
  abaInicial = "refeicao",
}: {
  receitas: ReceitaParaConsumo[];
  ingredientes: IngredienteOpcao[];
  agua: EntradaAgua[];
  receitaInicial?: string;
  abaInicial?: Aba;
}) {
  const [aba, setAba] = useState<Aba>(abaInicial);
  const { kcal, metaCalorica, aguaMl, metaAguaMl } = useDay();

  const abas: { id: Aba; label: string; icon: typeof Droplets; resumo: string }[] = [
    { id: "refeicao", label: "Refeição", icon: UtensilsCrossed, resumo: `${fmtNum(Math.round(kcal))} / ${fmtNum(metaCalorica)} kcal` },
    { id: "agua", label: "Água", icon: Droplets, resumo: `${fmtNum(aguaMl)} / ${fmtNum(metaAguaMl)} ml` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {abas.map(({ id, label, icon: Icon, resumo }) => {
          const ativa = aba === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setAba(id)}
              className={cx(
                "flex items-center gap-3 rounded-card border px-4 py-3 text-left transition-[border-color,background-color,box-shadow] duration-300 ease-organic",
                ativa ? "border-primary bg-surface shadow-soft" : "border-line bg-surface/60 hover:bg-surface",
              )}
            >
              <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", ativa ? "bg-primary-soft text-primary-deep" : "bg-bg text-text-muted")}>
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{label}</span>
                <span className="block truncate text-xs text-text-muted">{resumo}</span>
              </span>
            </button>
          );
        })}
      </div>

      {aba === "refeicao" ? (
        <ConsumoForm receitas={receitas} ingredientes={ingredientes} receitaInicial={receitaInicial} />
      ) : (
        <WaterPanel entradas={agua} />
      )}
    </div>
  );
}
