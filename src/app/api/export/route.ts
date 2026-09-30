import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/tags";
import { chaveDoDia } from "@/lib/date";

/**
 * Backup manual: o banco é local, então o app entrega tudo em um JSON
 * legível, com as receitas já resolvidas com o nome de cada ingrediente.
 */
// o backup precisa refletir o banco no momento do clique, nunca o do build
export const dynamic = "force-dynamic";

export async function GET() {
  const [ingredientes, receitas, consumos, aguas, meta] = await Promise.all([
    prisma.ingredient.findMany({ orderBy: [{ categoria: "asc" }, { nome: "asc" }] }),
    prisma.recipe.findMany({
      include: { ingredientes: { include: { ingredient: { select: { nome: true, unidade: true } } } } },
      orderBy: { titulo: "asc" },
    }),
    prisma.consumptionLog.findMany({ orderBy: { data: "asc" } }),
    prisma.waterLog.findMany({ orderBy: { data: "asc" } }),
    prisma.userGoal.findUnique({ where: { id: 1 } }),
  ]);

  const dados = {
    app: "cozinha",
    versao: 1,
    exportadoEm: new Date().toISOString(),
    metas: meta ? { metaCalorica: meta.metaCalorica, metaAguaMl: meta.metaAguaMl } : null,
    ingredientes: ingredientes.map(({ createdAt, updatedAt, ...i }) => i),
    receitas: receitas.map((r) => ({
      id: r.id,
      titulo: r.titulo,
      fotoUrl: r.fotoUrl,
      porcoes: r.porcoes,
      tags: parseTags(r.tags),
      modoPreparo: r.modoPreparo,
      ingredientes: r.ingredientes.map((i) => ({
        ingredientId: i.ingredientId,
        nome: i.ingredient.nome,
        quantidade: i.quantidade,
        unidade: i.ingredient.unidade,
      })),
    })),
    consumos: consumos.map((c) => ({ ...c, data: c.data.toISOString() })),
    agua: aguas.map((w) => ({ ...w, data: w.data.toISOString() })),
  };

  return new Response(JSON.stringify(dados, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="cozinha-backup-${chaveDoDia(new Date())}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
