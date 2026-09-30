import { UtensilsCrossed } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DayHydrator } from "@/components/DayHydrator";
import { Rings } from "@/components/dashboard/Rings";
import { Alerts } from "@/components/dashboard/Alerts";
import { LowStockBanner } from "@/components/dashboard/LowStockBanner";
import { GoalsButton } from "@/components/dashboard/GoalsButton";
import { WaterPanel } from "@/components/log/WaterPanel";
import { TodayLog } from "@/components/log/TodayLog";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { prisma } from "@/lib/prisma";
import { resumoDoDia } from "@/lib/day";
import { listarBaixos } from "@/lib/stock";
import { paraCard, receitaInclude } from "@/lib/recipes";
import { fmtDataLonga, fmtNum, saudacao } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [resumo, baixos, receitas] = await Promise.all([
    resumoDoDia(),
    listarBaixos(),
    prisma.recipe.findMany({ include: receitaInclude, orderBy: { createdAt: "desc" } }),
  ]);
  const sugestoes = receitas.map(paraCard).filter((r) => r.itens > 0 && r.faltando === 0).slice(0, 3);
  const restam = resumo.meta.metaCalorica - resumo.kcal;

  const frase =
    resumo.refeicoes.length === 0
      ? "Nada registrado ainda. Um copo de água é um bom começo."
      : restam > 0
        ? `Ainda cabem ${fmtNum(Math.round(restam))} kcal hoje.`
        : "Meta de calorias alcançada por hoje.";

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">{fmtDataLonga()}</p>
          <h1 className="mt-1 font-display text-4xl font-light md:text-5xl">{saudacao()}.</h1>
          <p className="mt-3 max-w-md text-text-muted">{frase}</p>
        </div>
        <div className="flex items-center gap-2">
          <GoalsButton />
          <ButtonLink href="/registrar" variant="accent">
            <UtensilsCrossed size={18} /> Registrar refeição
          </ButtonLink>
        </div>
      </header>

      <LowStockBanner baixos={baixos} />

      <DayHydrator kcal={resumo.kcal} aguaMl={resumo.aguaMl} metaCalorica={resumo.meta.metaCalorica} metaAguaMl={resumo.meta.metaAguaMl} />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card className="p-6 md:p-8">
          <Rings proteina={resumo.proteina} carboidrato={resumo.carboidrato} gordura={resumo.gordura} />
        </Card>
        <WaterPanel entradas={resumo.agua} compacto />
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Alerts baixos={baixos} />
        <Card className="p-5">
          <TodayLog refeicoes={resumo.refeicoes} titulo="Hoje no prato" />
        </Card>
      </section>

      {sugestoes.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-light">Dá para fazer agora</h2>
            <ButtonLink href="/receitas" variant="ghost" size="sm">
              Todas as receitas
            </ButtonLink>
          </div>
          <p className="mb-5 mt-1 text-sm text-text-muted">Receitas com todos os ingredientes na despensa.</p>
          <RecipeGrid receitas={sugestoes} />
        </section>
      )}
    </div>
  );
}
