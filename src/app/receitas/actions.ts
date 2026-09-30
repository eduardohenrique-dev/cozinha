"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeTags } from "@/lib/tags";
import { removerImagemEThumb } from "@/lib/storage";
import { receitaSchema, primeiroErro } from "@/lib/schemas";
import type { ResultadoAcao } from "@/lib/types";

export async function salvarReceita(input: unknown): Promise<ResultadoAcao<{ id: string }>> {
  const parsed = receitaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: primeiroErro(parsed.error) };
  const dados = parsed.data;

  const data = {
    titulo: dados.titulo,
    fotoUrl: dados.fotoUrl || null,
    modoPreparo: dados.modoPreparo,
    porcoes: dados.porcoes,
    tags: serializeTags(dados.tags),
  };
  const itens = dados.itens.map((i) => ({ ingredientId: i.ingredientId, quantidade: i.quantidade }));

  let id: string;
  if (dados.id) {
    const atual = await prisma.recipe.findUnique({ where: { id: dados.id }, select: { fotoUrl: true } });
    if (!atual) return { ok: false, erro: "Receita não encontrada." };
    await prisma.$transaction([
      prisma.recipeIngredient.deleteMany({ where: { recipeId: dados.id } }),
      prisma.recipe.update({ where: { id: dados.id }, data: { ...data, ingredientes: { create: itens } } }),
    ]);
    if (atual.fotoUrl && atual.fotoUrl !== data.fotoUrl) await removerImagemEThumb(atual.fotoUrl);
    id = dados.id;
  } else {
    const r = await prisma.recipe.create({ data: { ...data, ingredientes: { create: itens } } });
    id = r.id;
  }

  revalidatePath("/receitas");
  revalidatePath(`/receitas/${id}`);
  revalidatePath("/");
  return { ok: true, data: { id } };
}

export async function excluirReceita(id: string) {
  const r = await prisma.recipe.findUnique({ where: { id }, select: { fotoUrl: true } });
  if (r) {
    await prisma.recipe.delete({ where: { id } });
    await removerImagemEThumb(r.fotoUrl);
  }
  revalidatePath("/receitas");
  revalidatePath("/");
  redirect("/receitas");
}
