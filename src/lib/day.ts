import { prisma } from "@/lib/prisma";
import { intervaloDoDia, inicioDoDia, fimDoDia, chaveDoDia, ultimosDias } from "@/lib/date";
import type { Macros } from "@/lib/nutrition";
import { thumbDe } from "@/lib/images";

export type Refeicao = {
  id: string;
  hora: Date;
  nome: string;
  kcal: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
  quantidade: number;
  unidade: string | null;
  tipo: "receita" | "despensa" | "livre";
  thumbUrl: string | null;
  /** null quando a receita foi excluída depois: o registro continua íntegro pelo snapshot. */
  recipeId: string | null;
};

export type EntradaAgua = { id: string; hora: Date; ml: number };

export type ResumoDoDia = Macros & {
  aguaMl: number;
  meta: { metaCalorica: number; metaAguaMl: number };
  refeicoes: Refeicao[];
  agua: EntradaAgua[];
};

export async function obterMeta() {
  return prisma.userGoal.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
}

type LogRow = {
  id: string;
  data: Date;
  nome: string;
  caloriasTotais: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
  unidade: string | null;
  fotoUrl: string | null;
  porcoesConsumidas: number;
  recipeId: string | null;
  ingredientId: string | null;
};

/** Todo o conteúdo vem do snapshot gravado no log, nunca da receita atual. */
function paraRefeicao(l: LogRow): Refeicao {
  return {
    id: l.id,
    hora: l.data,
    nome: l.nome,
    kcal: l.caloriasTotais,
    proteina: l.proteina,
    carboidrato: l.carboidrato,
    gordura: l.gordura,
    quantidade: l.porcoesConsumidas,
    unidade: l.unidade,
    tipo: l.recipeId ? "receita" : l.ingredientId ? "despensa" : l.unidade ? "despensa" : "livre",
    thumbUrl: thumbDe(l.fotoUrl),
    recipeId: l.recipeId,
  };
}

function somar(refeicoes: Refeicao[]): Macros {
  return refeicoes.reduce<Macros>(
    (a, r) => ({
      kcal: a.kcal + r.kcal,
      proteina: a.proteina + r.proteina,
      carboidrato: a.carboidrato + r.carboidrato,
      gordura: a.gordura + r.gordura,
    }),
    { kcal: 0, proteina: 0, carboidrato: 0, gordura: 0 },
  );
}

export async function resumoDoDia(d = new Date()): Promise<ResumoDoDia> {
  const intervalo = intervaloDoDia(d);
  const [logs, agua, meta] = await Promise.all([
    prisma.consumptionLog.findMany({ where: { data: intervalo }, orderBy: { data: "asc" } }),
    prisma.waterLog.findMany({ where: { data: intervalo }, orderBy: { data: "asc" } }),
    obterMeta(),
  ]);

  const refeicoes = logs.map(paraRefeicao);
  return {
    ...somar(refeicoes),
    aguaMl: agua.reduce((a, w) => a + w.quantidadeMl, 0),
    meta: { metaCalorica: meta.metaCalorica, metaAguaMl: meta.metaAguaMl },
    refeicoes,
    agua: agua.map((w) => ({ id: w.id, hora: w.data, ml: w.quantidadeMl })),
  };
}

/* ---------- Histórico ---------- */

export type DiaResumo = {
  chave: string;
  data: Date;
  kcal: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
  aguaMl: number;
  refeicoes: number;
};

/** Agrega consumo e água por dia dentro do intervalo, incluindo dias vazios. */
export async function resumoPorDia(inicio: Date, fim: Date): Promise<DiaResumo[]> {
  const intervalo = { gte: inicioDoDia(inicio), lte: fimDoDia(fim) };
  const [logs, agua] = await Promise.all([
    prisma.consumptionLog.findMany({ where: { data: intervalo }, orderBy: { data: "asc" } }),
    prisma.waterLog.findMany({ where: { data: intervalo } }),
  ]);

  const mapa = new Map<string, DiaResumo>();
  const garantir = (d: Date) => {
    const chave = chaveDoDia(d);
    if (!mapa.has(chave))
      mapa.set(chave, { chave, data: inicioDoDia(d), kcal: 0, proteina: 0, carboidrato: 0, gordura: 0, aguaMl: 0, refeicoes: 0 });
    return mapa.get(chave)!;
  };

  for (let d = inicioDoDia(inicio); d <= fim; d = new Date(d.getTime() + 86400000)) garantir(d);
  for (const l of logs) {
    const dia = garantir(l.data);
    dia.kcal += l.caloriasTotais;
    dia.proteina += l.proteina;
    dia.carboidrato += l.carboidrato;
    dia.gordura += l.gordura;
    dia.refeicoes += 1;
  }
  for (const w of agua) garantir(w.data).aguaMl += w.quantidadeMl;

  return [...mapa.values()].sort((a, b) => a.data.getTime() - b.data.getTime());
}

/** Série dos últimos N dias, para o gráfico semanal. */
export async function serieUltimosDias(n = 7) {
  const dias = ultimosDias(n);
  const [resumos, meta] = await Promise.all([resumoPorDia(dias[0], dias[dias.length - 1]), obterMeta()]);
  return { dias: resumos, meta };
}

/** Dias com algum registro, para marcar o calendário. */
export async function diasComRegistro(inicio: Date, fim: Date): Promise<Set<string>> {
  const intervalo = { gte: inicioDoDia(inicio), lte: fimDoDia(fim) };
  const [logs, agua] = await Promise.all([
    prisma.consumptionLog.findMany({ where: { data: intervalo }, select: { data: true } }),
    prisma.waterLog.findMany({ where: { data: intervalo }, select: { data: true } }),
  ]);
  return new Set([...logs, ...agua].map((r) => chaveDoDia(r.data)));
}
