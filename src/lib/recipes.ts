import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { somaMacros, porPorcao, type Macros } from "@/lib/nutrition";
import { parseTags } from "@/lib/tags";
import { normalizar } from "@/lib/format";
import { thumbDe } from "@/lib/images";

export const receitaInclude = {
  ingredientes: { include: { ingredient: true }, orderBy: { quantidade: "desc" } },
} satisfies Prisma.RecipeInclude;

export type ReceitaCompleta = Prisma.RecipeGetPayload<{ include: typeof receitaInclude }>;

export function macrosDaReceita(r: ReceitaCompleta): Macros {
  return somaMacros(r.ingredientes.map((i) => ({ ingredient: i.ingredient, quantidade: i.quantidade })));
}

/** Quantas porções o estoque atual permite preparar (arredonda para meia porção). */
export function porcoesPossiveis(r: ReceitaCompleta) {
  if (r.ingredientes.length === 0) return 0;
  const fator = Math.min(
    ...r.ingredientes.map((i) => (i.quantidade > 0 ? i.ingredient.estoqueAtual / i.quantidade : Infinity)),
  );
  return Math.max(0, Math.floor(fator * r.porcoes * 2) / 2);
}

/** Ingredientes sem estoque suficiente para uma única porção. */
export function faltandoParaUmaPorcao(r: ReceitaCompleta) {
  return r.ingredientes.filter((i) => i.ingredient.estoqueAtual < i.quantidade / Math.max(r.porcoes, 1)).length;
}

export type ReceitaCard = {
  id: string;
  titulo: string;
  fotoUrl: string | null;
  thumbUrl: string | null;
  tags: string[];
  porcoes: number;
  kcalPorcao: number;
  itens: number;
  porcoesPossiveis: number;
  faltando: number;
};

export function paraCard(r: ReceitaCompleta): ReceitaCard {
  const m = porPorcao(macrosDaReceita(r), r.porcoes);
  return {
    id: r.id,
    titulo: r.titulo,
    fotoUrl: r.fotoUrl,
    thumbUrl: thumbDe(r.fotoUrl),
    tags: parseTags(r.tags),
    porcoes: r.porcoes,
    kcalPorcao: m.kcal,
    itens: r.ingredientes.length,
    porcoesPossiveis: porcoesPossiveis(r),
    faltando: faltandoParaUmaPorcao(r),
  };
}

export type FiltrosReceita = {
  q?: string;
  tag?: string;
  /** id de um ingrediente que a receita precisa conter */
  ingrediente?: string;
  /** so receitas com todos os ingredientes em estoque */
  daParaFazer?: boolean;
};

export async function listarReceitas(f: FiltrosReceita = {}) {
  const todas = await prisma.recipe.findMany({ include: receitaInclude, orderBy: { createdAt: "desc" } });
  const nq = f.q ? normalizar(f.q) : "";

  const filtradas = todas.filter((r) => {
    const tags = parseTags(r.tags);
    if (f.tag && !tags.includes(f.tag)) return false;
    if (f.ingrediente && !r.ingredientes.some((i) => i.ingredientId === f.ingrediente)) return false;
    if (f.daParaFazer && (r.ingredientes.length === 0 || faltandoParaUmaPorcao(r) > 0)) return false;
    if (nq) {
      const casaTitulo = normalizar(r.titulo).includes(nq);
      const casaTag = tags.some((t) => normalizar(t).includes(nq));
      const casaIngrediente = r.ingredientes.some((i) => normalizar(i.ingredient.nome).includes(nq));
      if (!casaTitulo && !casaTag && !casaIngrediente) return false;
    }
    return true;
  });

  const todasTags = [...new Set(todas.flatMap((r) => parseTags(r.tags)))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  // ingredientes que aparecem em alguma receita, para o seletor de filtro
  const usados = new Map<string, { id: string; nome: string; emEstoque: boolean }>();
  for (const r of todas) {
    for (const i of r.ingredientes) {
      if (!usados.has(i.ingredientId)) {
        usados.set(i.ingredientId, {
          id: i.ingredientId,
          nome: i.ingredient.nome,
          emEstoque: i.ingredient.estoqueAtual > 0,
        });
      }
    }
  }
  const ingredientesUsados = [...usados.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const prontas = todas.filter((r) => r.ingredientes.length > 0 && faltandoParaUmaPorcao(r) === 0).length;

  return { receitas: filtradas, todasTags, ingredientesUsados, total: todas.length, prontas };
}

export async function buscarReceita(id: string) {
  return prisma.recipe.findUnique({ where: { id }, include: receitaInclude });
}

export type ReceitaParaConsumo = ReceitaCard & {
  macrosPorcao: Macros;
  ingredientes: {
    ingredientId: string;
    nome: string;
    unidade: string;
    quantidade: number;
    estoqueAtual: number;
    estoqueMinimo: number;
  }[];
};

export function paraConsumo(r: ReceitaCompleta): ReceitaParaConsumo {
  return {
    ...paraCard(r),
    macrosPorcao: porPorcao(macrosDaReceita(r), r.porcoes),
    ingredientes: r.ingredientes.map((i) => ({
      ingredientId: i.ingredientId,
      nome: i.ingredient.nome,
      unidade: i.ingredient.unidade,
      quantidade: i.quantidade,
      estoqueAtual: i.ingredient.estoqueAtual,
      estoqueMinimo: i.ingredient.estoqueMinimo,
    })),
  };
}
