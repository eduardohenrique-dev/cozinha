import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { estaBaixo } from "@/lib/nutrition";

export { estaBaixo };

export type AlertaEstoque = {
  id: string;
  nome: string;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
};


/**
 * Debita do estoque a quantidade usada de cada ingrediente e devolve os que ficaram
 * em/abaixo do mínimo. Nunca deixa o estoque negativo.
 */
export async function debitarEstoque(
  tx: Prisma.TransactionClient,
  itens: { ingredientId: string; quantidade: number }[],
): Promise<AlertaEstoque[]> {
  const alertas: AlertaEstoque[] = [];
  for (const it of itens) {
    const ing = await tx.ingredient.findUnique({ where: { id: it.ingredientId } });
    if (!ing) continue;
    const novo = Math.max(0, ing.estoqueAtual - it.quantidade);
    await tx.ingredient.update({ where: { id: ing.id }, data: { estoqueAtual: novo } });
    if (estaBaixo({ estoqueAtual: novo, estoqueMinimo: ing.estoqueMinimo })) {
      alertas.push({ id: ing.id, nome: ing.nome, unidade: ing.unidade, estoqueAtual: novo, estoqueMinimo: ing.estoqueMinimo });
    }
  }
  return alertas;
}

/** Devolve ao estoque (usado ao apagar um registro de consumo). */
export async function creditarEstoque(
  tx: Prisma.TransactionClient,
  itens: { ingredientId: string; quantidade: number }[],
) {
  for (const it of itens) {
    await tx.ingredient.updateMany({
      where: { id: it.ingredientId },
      data: { estoqueAtual: { increment: it.quantidade } },
    });
  }
}

export async function listarBaixos(): Promise<AlertaEstoque[]> {
  const todos = await prisma.ingredient.findMany({ orderBy: [{ categoria: "asc" }, { nome: "asc" }] });
  return todos
    .filter(estaBaixo)
    .map((i) => ({ id: i.id, nome: i.nome, unidade: i.unidade, estoqueAtual: i.estoqueAtual, estoqueMinimo: i.estoqueMinimo }));
}
