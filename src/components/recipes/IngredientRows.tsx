"use client";

import Link from "next/link";
import { Plus, X } from "lucide-react";
import type { FieldArrayWithId, UseFormRegister } from "react-hook-form";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { macrosDe } from "@/lib/nutrition";
import { fmtNum, parseNum } from "@/lib/format";
import type { ReceitaForm } from "@/lib/schemas";
import type { IngredienteOpcao } from "@/lib/types";

type Item = { ingredientId: string; quantidade: string | number };

export function IngredientRows({
  campos,
  valores,
  register,
  onAdd,
  onRemove,
  opcoes,
  erro,
}: {
  campos: FieldArrayWithId<ReceitaForm, "itens", "id">[];
  valores: Item[];
  register: UseFormRegister<ReceitaForm>;
  onAdd: () => void;
  onRemove: (i: number) => void;
  opcoes: IngredienteOpcao[];
  erro?: string;
}) {
  const porId = new Map(opcoes.map((o) => [o.id, o]));
  const grupos = opcoes.reduce<Record<string, IngredienteOpcao[]>>((acc, o) => {
    (acc[o.categoria] ??= []).push(o);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {campos.map((campo, i) => {
        const atual = valores?.[i];
        const ing = atual ? porId.get(atual.ingredientId) : undefined;
        const qtd = atual ? parseNum(atual.quantidade) : 0;
        const kcal = ing && qtd > 0 ? macrosDe(ing, qtd).kcal : 0;
        return (
          <div
            key={campo.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_8.5rem_5.5rem_auto] sm:items-center"
          >
            <Select {...register(`itens.${i}.ingredientId`)} aria-label="Ingrediente">
              <option value="">Escolha um ingrediente…</option>
              {Object.entries(grupos).map(([cat, lista]) => (
                <optgroup key={cat} label={cat}>
                  {lista.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
            <Button variant="ghost" size="icon" onClick={() => onRemove(i)} aria-label="Remover linha" className="sm:order-last">
              <X size={18} />
            </Button>
            <Input
              inputMode="decimal"
              placeholder="Qtd."
              {...register(`itens.${i}.quantidade`)}
              suffix={ing?.unidade ?? ""}
              aria-label="Quantidade"
            />
            <p className="text-sm text-text-muted sm:text-right">{kcal > 0 ? `${fmtNum(Math.round(kcal))} kcal` : "—"}</p>
          </div>
        );
      })}

      {erro && <p className="text-sm text-danger-strong">{erro}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button variant="soft" size="sm" onClick={onAdd}>
          <Plus size={16} /> Adicionar ingrediente
        </Button>
        <Link href="/despensa" className="text-xs text-text-muted underline-offset-2 hover:underline">
          Falta algum? Cadastre na despensa
        </Link>
      </div>
    </div>
  );
}
