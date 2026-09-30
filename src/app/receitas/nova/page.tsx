import { PageHeader } from "@/components/ui/PageHeader";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/tags";
import { selecaoIngredienteOpcao } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NovaReceitaPage() {
  const [ingredientes, receitas] = await Promise.all([
    prisma.ingredient.findMany({ select: selecaoIngredienteOpcao, orderBy: [{ categoria: "asc" }, { nome: "asc" }] }),
    prisma.recipe.findMany({ select: { tags: true } }),
  ]);
  const tagsSugeridas = [...new Set(receitas.flatMap((r) => parseTags(r.tags)))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Receitas" title="Nova receita" />
      <RecipeForm ingredientes={ingredientes} tagsSugeridas={tagsSugeridas} />
    </div>
  );
}
