import { PageHeader } from "@/components/ui/PageHeader";
import { PantryList } from "@/components/pantry/PantryList";
import { prisma } from "@/lib/prisma";
import { estaBaixo } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function DespensaPage({ searchParams }: { searchParams: { falta?: string } }) {
  const ingredientes = await prisma.ingredient.findMany({
    include: { receitas: { select: { recipe: { select: { titulo: true } } } } },
    orderBy: [{ categoria: "asc" }, { nome: "asc" }],
  });

  const itens = ingredientes.map((i) => ({
    id: i.id,
    nome: i.nome,
    unidade: i.unidade,
    categoria: i.categoria,
    caloriasPor100g: i.caloriasPor100g,
    proteina: i.proteina,
    carboidrato: i.carboidrato,
    gordura: i.gordura,
    estoqueAtual: i.estoqueAtual,
    estoqueMinimo: i.estoqueMinimo,
    pesoUnidadeG: i.pesoUnidadeG,
    receitas: i.receitas.map((r) => r.recipe.titulo).sort((a, b) => a.localeCompare(b, "pt-BR")),
  }));
  const baixos = ingredientes.filter(estaBaixo).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Em casa"
        title="Despensa"
        subtitle={
          itens.length === 0
            ? undefined
            : baixos === 0
              ? `${itens.length} itens, tudo abastecido.`
              : `${itens.length} itens · ${baixos} ${baixos === 1 ? "precisa" : "precisam"} de reposição.`
        }
      />
      <PantryList itens={itens} soBaixosInicial={searchParams.falta === "1"} />
    </div>
  );
}
