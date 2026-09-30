"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ingredienteSchema, primeiroErro } from "@/lib/schemas";
import type { ResultadoAcao } from "@/lib/types";
import { estaBaixo } from "@/lib/nutrition";


function revalidar() {
  revalidatePath("/despensa");
  revalidatePath("/receitas");
  revalidatePath("/registrar");
  revalidatePath("/");
}

export async function salvarIngrediente(input: unknown): Promise<ResultadoAcao<{ id: string }>> {
  const parsed = ingredienteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: primeiroErro(parsed.error) };
  const input2 = parsed.data;

  const data = {
    nome: input2.nome,
    unidade: input2.unidade,
    categoria: input2.categoria,
    caloriasPor100g: input2.caloriasPor100g,
    proteina: input2.proteina,
    carboidrato: input2.carboidrato,
    gordura: input2.gordura,
    estoqueAtual: input2.estoqueAtual,
    estoqueMinimo: input2.estoqueMinimo,
    pesoUnidadeG: input2.pesoUnidadeG,
  };

  const r = input2.id
    ? await prisma.ingredient.update({ where: { id: input2.id }, data })
    : await prisma.ingredient.create({ data });

  revalidar();
  return { ok: true, data: { id: r.id } };
}

/** Exclui o item da despensa. Ele também sai das receitas em que aparecia (cascade no schema). */
export async function excluirIngrediente(id: string): Promise<ResultadoAcao<{ receitas: string[] }>> {
  const ing = await prisma.ingredient.findUnique({
    where: { id },
    select: { receitas: { select: { recipe: { select: { titulo: true } } } } },
  });
  if (!ing) return { ok: false, erro: "Ingrediente não encontrado." };

  const receitas = ing.receitas.map((r) => r.recipe.titulo).sort((a, b) => a.localeCompare(b, "pt-BR"));
  await prisma.ingredient.delete({ where: { id } });
  revalidar();
  return { ok: true, data: { receitas } };
}

/** Soma (ou subtrai) do estoque; nunca fica negativo. */
export async function ajustarEstoque(
  id: string,
  delta: number,
): Promise<ResultadoAcao<{ estoqueAtual: number; abaixo: boolean }>> {
  const ing = await prisma.ingredient.findUnique({ where: { id } });
  if (!ing) return { ok: false, erro: "Ingrediente não encontrado." };
  const estoqueAtual = Math.max(0, Math.round((ing.estoqueAtual + delta) * 100) / 100);
  await prisma.ingredient.update({ where: { id }, data: { estoqueAtual } });
  revalidar();
  return { ok: true, data: { estoqueAtual, abaixo: estaBaixo({ estoqueAtual, estoqueMinimo: ing.estoqueMinimo }) } };
}
