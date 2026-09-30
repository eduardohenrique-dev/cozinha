"use client";

import { useReveal } from "@/components/gsap/useReveal";
import type { ReceitaCard } from "@/lib/recipes";
import { RecipeCard } from "./RecipeCard";

export function RecipeGrid({ receitas }: { receitas: ReceitaCard[] }) {
  const ref = useReveal<HTMLDivElement>([receitas.map((r) => r.id).join()]);
  return (
    <div ref={ref} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {receitas.map((r, i) => (
        <RecipeCard key={r.id} r={r} alt={i % 3 === 1} />
      ))}
    </div>
  );
}
