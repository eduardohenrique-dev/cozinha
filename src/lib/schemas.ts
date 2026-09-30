import { z } from "zod";

/**
 * Fonte única de validação: os formulários usam estes schemas via react-hook-form
 * e as Server Actions revalidam com os mesmos antes de tocar no banco.
 */

/** Campo numérico digitado: aceita vírgula decimal e devolve number. */
const numeroTexto = (msg: string) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === "number" ? v : Number(String(v).replace(",", ".").trim())))
    .refine((v) => Number.isFinite(v), { message: msg });

const positivo = (msg: string, campo = "Valor") =>
  numeroTexto(`${campo} precisa ser um número.`).refine((v) => v > 0, { message: msg });

const naoNegativo = (campo: string) =>
  numeroTexto(`${campo} precisa ser um número.`).refine((v) => v >= 0, { message: `${campo} não pode ser negativo.` });

export const unidadeSchema = z.enum(["g", "ml", "un"], { error: "Unidade inválida." });

/* ---------- Receita ---------- */

export const itemReceitaSchema = z.object({
  ingredientId: z.string().min(1, "Escolha um ingrediente."),
  quantidade: positivo("A quantidade precisa ser maior que zero.", "Quantidade"),
});

export const receitaSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().trim().min(1, "Dê um nome à receita.").max(120, "Nome muito longo."),
  fotoUrl: z.string().nullable().default(null),
  modoPreparo: z.string().trim().default(""),
  porcoes: numeroTexto("Porções precisa ser um número.")
    .refine((v) => v >= 1, { message: "A receita rende pelo menos 1 porção." })
    .refine((v) => v <= 100, { message: "No máximo 100 porções." })
    .transform(Math.round),
  tags: z.array(z.string()).default([]),
  itens: z
    .array(itemReceitaSchema)
    .min(1, "Adicione pelo menos um ingrediente.")
    .refine((itens) => new Set(itens.map((i) => i.ingredientId)).size === itens.length, {
      message: "Há ingredientes repetidos na lista.",
    }),
});

export type ReceitaForm = z.input<typeof receitaSchema>;
export type ReceitaData = z.output<typeof receitaSchema>;

/* ---------- Ingrediente ---------- */

export const ingredienteSchema = z
  .object({
    id: z.string().optional(),
    nome: z.string().trim().min(1, "Dê um nome ao ingrediente.").max(120, "Nome muito longo."),
    categoria: z.string().trim().default("Outros"),
    unidade: unidadeSchema,
    caloriasPor100g: naoNegativo("Calorias"),
    proteina: naoNegativo("Proteína"),
    carboidrato: naoNegativo("Carboidrato"),
    gordura: naoNegativo("Gordura"),
    estoqueAtual: naoNegativo("Estoque"),
    estoqueMinimo: naoNegativo("Estoque mínimo"),
    pesoUnidadeG: z
      .union([z.string(), z.number(), z.null()])
      .transform((v) => {
        if (v === null || v === "") return null;
        const n = Number(String(v).replace(",", ".").trim());
        return Number.isFinite(n) ? n : null;
      })
      .nullable()
      .default(null),
  })
  .refine((d) => d.unidade !== "un" || (d.pesoUnidadeG !== null && d.pesoUnidadeG > 0), {
    message: "Informe quanto pesa uma unidade, em gramas.",
    path: ["pesoUnidadeG"],
  })
  .transform((d) => ({ ...d, categoria: d.categoria || "Outros", pesoUnidadeG: d.unidade === "un" ? d.pesoUnidadeG : null }));

export type IngredienteForm = z.input<typeof ingredienteSchema>;
export type IngredienteData = z.output<typeof ingredienteSchema>;

/* ---------- Consumo ---------- */

export const consumoReceitaSchema = z.object({
  recipeId: z.string().min(1, "Escolha uma receita."),
  porcoes: positivo("Informe quantas porções você comeu.", "Porções").refine((v) => v <= 50, {
    message: "No máximo 50 porções.",
  }),
  data: z.coerce.date().optional(),
});

export const consumoAvulsoSchema = z
  .object({
    ingredientId: z.string().nullable().default(null),
    quantidade: numeroTexto("Quantidade precisa ser um número.").default(0),
    nome: z.string().trim().default(""),
    kcal: naoNegativo("Calorias").default(0),
    data: z.coerce.date().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.ingredientId) {
      if (!(d.quantidade > 0))
        ctx.addIssue({ code: "custom", message: "Informe a quantidade.", path: ["quantidade"] });
    } else if (!d.nome) {
      ctx.addIssue({ code: "custom", message: "O que você comeu?", path: ["nome"] });
    }
  });

export const editarConsumoSchema = z.object({
  id: z.string().min(1),
  quantidade: positivo("A quantidade precisa ser maior que zero.", "Quantidade"),
  kcal: naoNegativo("Calorias").optional(),
});

export type ConsumoReceitaData = z.output<typeof consumoReceitaSchema>;
export type ConsumoAvulsoData = z.output<typeof consumoAvulsoSchema>;

/* ---------- Água e metas ---------- */

export const aguaSchema = z.object({
  quantidadeMl: positivo("Informe uma quantidade.", "Quantidade").refine((v) => v <= 5000, {
    message: "No máximo 5000 ml de uma vez.",
  }),
});

export const metasSchema = z.object({
  metaCalorica: numeroTexto("Meta calórica precisa ser um número.")
    .refine((v) => v >= 500 && v <= 8000, { message: "Entre 500 e 8000 kcal." })
    .transform(Math.round),
  metaAguaMl: numeroTexto("Meta de água precisa ser um número.")
    .refine((v) => v >= 500 && v <= 8000, { message: "Entre 500 e 8000 ml." })
    .transform(Math.round),
});

export type MetasForm = z.input<typeof metasSchema>;

/** Traduz um erro do zod na primeira mensagem legível, para devolver da action. */
export function primeiroErro(e: z.ZodError): string {
  return e.issues[0]?.message ?? "Dados inválidos.";
}
