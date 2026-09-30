import type { Ingredient } from "@prisma/client";

export type ItemReceitaInput = { ingredientId: string; quantidade: number };

export type ReceitaInput = {
  id?: string;
  titulo: string;
  fotoUrl: string | null;
  modoPreparo: string;
  porcoes: number;
  tags: string[];
  itens: ItemReceitaInput[];
};

export type IngredienteOpcao = Pick<
  Ingredient,
  | "id"
  | "nome"
  | "unidade"
  | "categoria"
  | "caloriasPor100g"
  | "proteina"
  | "carboidrato"
  | "gordura"
  | "pesoUnidadeG"
  | "estoqueAtual"
  | "estoqueMinimo"
>;

export const selecaoIngredienteOpcao = {
  id: true,
  nome: true,
  unidade: true,
  categoria: true,
  caloriasPor100g: true,
  proteina: true,
  carboidrato: true,
  gordura: true,
  pesoUnidadeG: true,
  estoqueAtual: true,
  estoqueMinimo: true,
} as const;

export type ResultadoAcao<T = undefined> = { ok: true; data: T } | { ok: false; erro: string };
