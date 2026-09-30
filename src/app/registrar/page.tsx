import { PageHeader } from "@/components/ui/PageHeader";
import { DayHydrator } from "@/components/DayHydrator";
import { RegistrarHub } from "@/components/log/RegistrarHub";
import { TodayLog } from "@/components/log/TodayLog";
import { prisma } from "@/lib/prisma";
import { paraConsumo, receitaInclude } from "@/lib/recipes";
import { resumoDoDia } from "@/lib/day";
import { selecaoIngredienteOpcao } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RegistrarPage({ searchParams }: { searchParams: { receita?: string; aba?: string } }) {
  const [receitas, ingredientes, resumo] = await Promise.all([
    prisma.recipe.findMany({ include: receitaInclude, orderBy: { titulo: "asc" } }),
    prisma.ingredient.findMany({ select: selecaoIngredienteOpcao, orderBy: [{ categoria: "asc" }, { nome: "asc" }] }),
    resumoDoDia(),
  ]);

  const receitaInicial = receitas.some((r) => r.id === searchParams.receita) ? searchParams.receita : undefined;

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Agora" title="Registrar" subtitle="Toque rápido, direto da cozinha." />
      <DayHydrator kcal={resumo.kcal} aguaMl={resumo.aguaMl} metaCalorica={resumo.meta.metaCalorica} metaAguaMl={resumo.meta.metaAguaMl} />
      <RegistrarHub
        receitas={receitas.map(paraConsumo)}
        ingredientes={ingredientes}
        agua={resumo.agua}
        receitaInicial={receitaInicial}
        abaInicial={searchParams.aba === "agua" ? "agua" : "refeicao"}
      />
      <TodayLog refeicoes={resumo.refeicoes} />
    </div>
  );
}
