import type { Ingredient } from "@prisma/client";

type IngredienteBase = Pick<
  Ingredient,
  "unidade" | "pesoUnidadeG" | "caloriasPor100g" | "proteina" | "carboidrato" | "gordura"
>;

export type Macros = { kcal: number; proteina: number; carboidrato: number; gordura: number };

/** Quantidade na unidade do ingrediente -> gramas/ml equivalentes. */
export function emGramas(ing: Pick<Ingredient, "unidade" | "pesoUnidadeG">, quantidade: number) {
  return ing.unidade === "un" ? quantidade * (ing.pesoUnidadeG ?? 0) : quantidade;
}

export function macrosDe(ing: IngredienteBase, quantidade: number): Macros {
  const f = emGramas(ing, quantidade) / 100;
  return {
    kcal: ing.caloriasPor100g * f,
    proteina: ing.proteina * f,
    carboidrato: ing.carboidrato * f,
    gordura: ing.gordura * f,
  };
}

export function somaMacros(itens: { ingredient: IngredienteBase; quantidade: number }[]): Macros {
  return itens.reduce<Macros>(
    (acc, { ingredient, quantidade }) => {
      const m = macrosDe(ingredient, quantidade);
      return {
        kcal: acc.kcal + m.kcal,
        proteina: acc.proteina + m.proteina,
        carboidrato: acc.carboidrato + m.carboidrato,
        gordura: acc.gordura + m.gordura,
      };
    },
    { kcal: 0, proteina: 0, carboidrato: 0, gordura: 0 },
  );
}

export function porPorcao(m: Macros, porcoes: number): Macros {
  const d = Math.max(porcoes, 1);
  return { kcal: m.kcal / d, proteina: m.proteina / d, carboidrato: m.carboidrato / d, gordura: m.gordura / d };
}

/** Alerta só para itens com mínimo definido (> 0). Mínimo 0 = item não monitorado. */
export const estaBaixo = (i: { estoqueAtual: number; estoqueMinimo: number }) =>
  i.estoqueMinimo > 0 && i.estoqueAtual <= i.estoqueMinimo;
