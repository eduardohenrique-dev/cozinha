"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { macrosDe, porPorcao } from "@/lib/nutrition";
import { macrosDaReceita, receitaInclude } from "@/lib/recipes";
import { creditarEstoque, debitarEstoque, type AlertaEstoque } from "@/lib/stock";
import { intervaloDoDia } from "@/lib/date";
import {
  aguaSchema,
  consumoAvulsoSchema,
  consumoReceitaSchema,
  editarConsumoSchema,
  metasSchema,
  primeiroErro,
} from "@/lib/schemas";
import type { ResultadoAcao } from "@/lib/types";

function revalidar() {
  for (const p of ["/", "/registrar", "/despensa", "/receitas", "/historico"]) revalidatePath(p);
}

type RegistroConsumo = { kcal: number; alertas: AlertaEstoque[] };

/** Itens de uma receita escalados para as porções consumidas. */
function itensEscalados(recipe: Prisma.RecipeGetPayload<{ include: typeof receitaInclude }>, porcoes: number) {
  const fator = porcoes / Math.max(recipe.porcoes, 1);
  return recipe.ingredientes.map((i) => ({ ingredientId: i.ingredientId, quantidade: i.quantidade * fator }));
}

/**
 * Coração do app: registra a refeição, calcula as calorias a partir dos ingredientes,
 * grava um snapshot do que foi comido e debita do estoque o proporcional às porções.
 */
export async function registrarConsumoReceita(input: unknown): Promise<ResultadoAcao<RegistroConsumo>> {
  const parsed = consumoReceitaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: primeiroErro(parsed.error) };
  const { recipeId, porcoes, data } = parsed.data;

  try {
    const r = await prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findUnique({ where: { id: recipeId }, include: receitaInclude });
      if (!recipe) throw new Error("Receita não encontrada.");

      const m = porPorcao(macrosDaReceita(recipe), recipe.porcoes);
      await tx.consumptionLog.create({
        data: {
          recipeId: recipe.id,
          nome: recipe.titulo,
          fotoUrl: recipe.fotoUrl,
          porcoesConsumidas: porcoes,
          caloriasTotais: m.kcal * porcoes,
          proteina: m.proteina * porcoes,
          carboidrato: m.carboidrato * porcoes,
          gordura: m.gordura * porcoes,
          ...(data ? { data } : {}),
        },
      });
      const alertas = await debitarEstoque(tx, itensEscalados(recipe, porcoes));
      return { kcal: m.kcal * porcoes, alertas };
    });
    revalidar();
    return { ok: true, data: r };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Não deu para registrar." };
  }
}

export async function registrarConsumoAvulso(input: unknown): Promise<ResultadoAcao<RegistroConsumo>> {
  const parsed = consumoAvulsoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: primeiroErro(parsed.error) };
  const { ingredientId, quantidade, nome, kcal, data } = parsed.data;

  if (ingredientId) {
    try {
      const r = await prisma.$transaction(async (tx) => {
        const ing = await tx.ingredient.findUnique({ where: { id: ingredientId } });
        if (!ing) throw new Error("Ingrediente não encontrado.");
        const m = macrosDe(ing, quantidade);
        await tx.consumptionLog.create({
          data: {
            ingredientId: ing.id,
            nome: ing.nome,
            unidade: ing.unidade,
            porcoesConsumidas: quantidade,
            caloriasTotais: m.kcal,
            proteina: m.proteina,
            carboidrato: m.carboidrato,
            gordura: m.gordura,
            ...(data ? { data } : {}),
          },
        });
        const alertas = await debitarEstoque(tx, [{ ingredientId: ing.id, quantidade }]);
        return { kcal: m.kcal, alertas };
      });
      revalidar();
      return { ok: true, data: r };
    } catch (e) {
      return { ok: false, erro: e instanceof Error ? e.message : "Não deu para registrar." };
    }
  }

  await prisma.consumptionLog.create({
    data: { nome, porcoesConsumidas: 1, caloriasTotais: kcal, ...(data ? { data } : {}) },
  });
  revalidar();
  return { ok: true, data: { kcal, alertas: [] } };
}

/**
 * Edita a quantidade de um registro: acerta o estoque pela diferença e
 * recalcula o snapshot proporcionalmente ao que já estava gravado.
 */
export async function editarConsumo(input: unknown): Promise<ResultadoAcao<RegistroConsumo>> {
  const parsed = editarConsumoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: primeiroErro(parsed.error) };
  const { id, quantidade, kcal } = parsed.data;

  try {
    const r = await prisma.$transaction(async (tx) => {
      const log = await tx.consumptionLog.findUnique({ where: { id }, include: { recipe: { include: receitaInclude } } });
      if (!log) throw new Error("Registro não encontrado.");

      const anterior = log.porcoesConsumidas;
      const delta = quantidade - anterior;
      let alertas: AlertaEstoque[] = [];

      if (log.recipe) {
        const escala = Math.abs(delta) / Math.max(log.recipe.porcoes, 1);
        const itens = log.recipe.ingredientes.map((i) => ({ ingredientId: i.ingredientId, quantidade: i.quantidade * escala }));
        if (delta > 0) alertas = await debitarEstoque(tx, itens);
        else if (delta < 0) await creditarEstoque(tx, itens);
      } else if (log.ingredientId) {
        const itens = [{ ingredientId: log.ingredientId, quantidade: Math.abs(delta) }];
        if (delta > 0) alertas = await debitarEstoque(tx, itens);
        else if (delta < 0) await creditarEstoque(tx, itens);
      }

      // snapshot escala junto; para o item livre, as calorias vêm do formulário
      const f = anterior > 0 ? quantidade / anterior : 1;
      const semVinculo = !log.recipeId && !log.ingredientId;
      const novasKcal = semVinculo && kcal !== undefined ? kcal : log.caloriasTotais * f;

      await tx.consumptionLog.update({
        where: { id },
        data: {
          porcoesConsumidas: quantidade,
          caloriasTotais: novasKcal,
          proteina: log.proteina * f,
          carboidrato: log.carboidrato * f,
          gordura: log.gordura * f,
        },
      });
      return { kcal: novasKcal - log.caloriasTotais, alertas };
    });
    revalidar();
    return { ok: true, data: r };
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : "Não deu para editar." };
  }
}

/** Apaga o registro e devolve ao estoque o que tinha sido debitado. */
export async function excluirConsumo(id: string): Promise<ResultadoAcao<{ kcal: number; devolvido: boolean }>> {
  const log = await prisma.consumptionLog.findUnique({ where: { id }, include: { recipe: { include: receitaInclude } } });
  if (!log) return { ok: false, erro: "Registro não encontrado." };

  let devolvido = false;
  await prisma.$transaction(async (tx) => {
    if (log.recipe) {
      await creditarEstoque(tx, itensEscalados(log.recipe, log.porcoesConsumidas));
      devolvido = true;
    } else if (log.ingredientId) {
      await creditarEstoque(tx, [{ ingredientId: log.ingredientId, quantidade: log.porcoesConsumidas }]);
      devolvido = true;
    }
    await tx.consumptionLog.delete({ where: { id } });
  });
  revalidar();
  return { ok: true, data: { kcal: log.caloriasTotais, devolvido } };
}

async function totalAguaHoje() {
  const r = await prisma.waterLog.aggregate({ _sum: { quantidadeMl: true }, where: { data: intervaloDoDia() } });
  return r._sum.quantidadeMl ?? 0;
}

export async function registrarAgua(ml: number): Promise<ResultadoAcao<{ id: string; totalMl: number }>> {
  const parsed = aguaSchema.safeParse({ quantidadeMl: ml });
  if (!parsed.success) return { ok: false, erro: primeiroErro(parsed.error) };
  const w = await prisma.waterLog.create({ data: { quantidadeMl: Math.round(parsed.data.quantidadeMl) } });
  revalidatePath("/");
  revalidatePath("/registrar");
  revalidatePath("/historico");
  return { ok: true, data: { id: w.id, totalMl: await totalAguaHoje() } };
}

export async function excluirAgua(id: string): Promise<ResultadoAcao<{ ml: number; totalMl: number }>> {
  const w = await prisma.waterLog.findUnique({ where: { id } });
  if (!w) return { ok: false, erro: "Registro não encontrado." };
  await prisma.waterLog.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/registrar");
  revalidatePath("/historico");
  return { ok: true, data: { ml: w.quantidadeMl, totalMl: await totalAguaHoje() } };
}

/** Apaga todos os registros de água de hoje. Não mexe nas refeições. */
export async function zerarAguaDoDia(): Promise<ResultadoAcao<{ apagados: number; ml: number }>> {
  const doDia = { data: intervaloDoDia() };
  const logs = await prisma.waterLog.findMany({ where: doDia, select: { quantidadeMl: true } });
  if (logs.length === 0) return { ok: false, erro: "Não há água registrada hoje." };

  const ml = logs.reduce((a, w) => a + w.quantidadeMl, 0);
  const { count } = await prisma.waterLog.deleteMany({ where: doDia });

  revalidatePath("/");
  revalidatePath("/registrar");
  revalidatePath("/historico");
  return { ok: true, data: { apagados: count, ml } };
}

export async function salvarMetas(input: unknown): Promise<ResultadoAcao> {
  const parsed = metasSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: primeiroErro(parsed.error) };
  const { metaCalorica, metaAguaMl } = parsed.data;
  await prisma.userGoal.upsert({
    where: { id: 1 },
    update: { metaCalorica, metaAguaMl },
    create: { id: 1, metaCalorica, metaAguaMl },
  });
  revalidar();
  return { ok: true, data: undefined };
}

