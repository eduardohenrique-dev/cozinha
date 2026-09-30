import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { prisma } from "@/lib/prisma";
import { buscarReceita } from "@/lib/recipes";
import { parseTags } from "@/lib/tags";
import { selecaoIngredienteOpcao } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditarReceitaPage({ params }: { params: { id: string } }) {
  const [receita, ingredientes, receitas] = await Promise.all([
    buscarReceita(params.id),
    prisma.ingredient.findMany({ select: selecaoIngredienteOpcao, orderBy: [{ categoria: "asc" }, { nome: "asc" }] }),
    prisma.recipe.findMany({ select: { tags: true } }),
  ]);
  if (!receita) notFound();

  const tagsSugeridas = [...new Set(receitas.flatMap((r) => parseTags(r.tags)))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Receitas" title={`Editar “${receita.titulo}”`} />
      <RecipeForm
        ingredientes={ingredientes}
        tagsSugeridas={tagsSugeridas}
        inicial={{
          id: receita.id,
          titulo: receita.titulo,
          fotoUrl: receita.fotoUrl,
          modoPreparo: receita.modoPreparo,
          porcoes: receita.porcoes,
          tags: parseTags(receita.tags),
          itens: receita.ingredientes.map((i) => ({ ingredientId: i.ingredientId, quantidade: i.quantidade })),
        }}
      />
    </div>
  );
}
