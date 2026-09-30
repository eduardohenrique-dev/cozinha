import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyRecipesArt } from "@/components/illustrations";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { SearchBar } from "@/components/recipes/SearchBar";
import { listarReceitas, paraCard } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export default async function ReceitasPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; ingrediente?: string; daParaFazer?: string };
}) {
  const { receitas, todasTags, ingredientesUsados, total, prontas } = await listarReceitas({
    q: searchParams.q,
    tag: searchParams.tag,
    ingrediente: searchParams.ingrediente,
    daParaFazer: searchParams.daParaFazer === "1",
  });
  const cards = receitas.map(paraCard);
  const filtrando = Boolean(searchParams.q || searchParams.tag || searchParams.ingrediente || searchParams.daParaFazer);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Seu caderno"
        title="Receitas"
        subtitle={
          total > 0
            ? `${total} ${total === 1 ? "receita guardada" : "receitas guardadas"}${prontas > 0 ? `, ${prontas} com tudo na despensa` : ""}.`
            : undefined
        }
        action={
          <ButtonLink href="/receitas/nova">
            <Plus size={18} /> Nova receita
          </ButtonLink>
        }
      />

      {total > 0 && (
        <Suspense>
          <SearchBar
            tags={todasTags}
            ingredientes={ingredientesUsados}
            prontas={prontas}
            placeholder="Buscar por nome, tag ou ingrediente…"
          />
        </Suspense>
      )}

      {cards.length > 0 ? (
        <RecipeGrid receitas={cards} />
      ) : filtrando ? (
        <EmptyState
          art={<EmptyRecipesArt />}
          title="Nada por aqui"
          text="Nenhuma receita bate com esses filtros. Tente outro ingrediente, outra tag, ou limpe os filtros."
        />
      ) : (
        <EmptyState
          art={<EmptyRecipesArt />}
          title="Seu caderno está em branco"
          text="Guarde a primeira receita com foto, ingredientes e modo de preparo. As calorias são calculadas sozinhas."
          action={
            <ButtonLink href="/receitas/nova">
              <Plus size={18} /> Criar receita
            </ButtonLink>
          }
        />
      )}
    </div>
  );
}
