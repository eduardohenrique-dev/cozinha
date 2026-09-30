import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, UtensilsCrossed } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { EmptyPhotoArt } from "@/components/illustrations";
import { DeleteRecipeButton } from "@/components/recipes/DeleteRecipeButton";
import { buscarReceita, faltandoParaUmaPorcao, macrosDaReceita, porcoesPossiveis } from "@/lib/recipes";
import { macrosDe, porPorcao } from "@/lib/nutrition";
import { parseTags } from "@/lib/tags";
import { fmtNum, fmtQtd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReceitaPage({ params }: { params: { id: string } }) {
  const r = await buscarReceita(params.id);
  if (!r) notFound();

  const tags = parseTags(r.tags);
  const total = macrosDaReceita(r);
  const porcao = porPorcao(total, r.porcoes);
  const possiveis = porcoesPossiveis(r);
  const faltando = faltandoParaUmaPorcao(r);
  const passos = r.modoPreparo.split("\n").map((s) => s.trim()).filter(Boolean);

  const macroTiles = [
    { label: "kcal", valor: porcao.kcal, dig: 0 },
    { label: "proteína", valor: porcao.proteina, dig: 0, un: "g" },
    { label: "carbo", valor: porcao.carboidrato, dig: 0, un: "g" },
    { label: "gordura", valor: porcao.gordura, dig: 0, un: "g" },
  ];

  return (
    <div className="space-y-10">
      <Link href="/receitas" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={16} /> Receitas
      </Link>

      <section className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start">
        <div className="overflow-hidden rounded-card bg-bg shadow-soft">
          <div className="aspect-[4/3]">
            {r.fotoUrl ? <img src={r.fotoUrl} alt={r.titulo} className="h-full w-full object-cover" /> : <EmptyPhotoArt />}
          </div>
        </div>

        <div>
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          )}
          <h1 className="font-display text-4xl font-light leading-[1.05] md:text-5xl">{r.titulo}</h1>
          <p className="mt-3 text-text-muted">
            Rende {r.porcoes} {r.porcoes === 1 ? "porção" : "porções"} ·{" "}
            {r.ingredientes.length === 0 ? (
              <>sem ingredientes cadastrados</>
            ) : faltando === 0 ? (
              <>
                dá para fazer <span className="font-medium text-text">{fmtNum(possiveis, 1)}</span> com o que tem na
                despensa
              </>
            ) : (
              <>
                faltam <span className="font-medium text-text">{faltando}</span>{" "}
                {faltando === 1 ? "ingrediente" : "ingredientes"} na despensa
              </>
            )}
          </p>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {macroTiles.map((m, i) => (
              <Card key={m.label} alt={i % 2 === 1} className="px-3 py-4 text-center">
                <p className="num-display text-2xl md:text-3xl">
                  {fmtNum(m.valor, m.dig)}
                  {m.un && <span className="text-sm not-italic text-text-faint">{m.un}</span>}
                </p>
                <p className="mt-1 text-xs text-text-muted">{m.label}</p>
              </Card>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-faint">por porção</p>

          <div className="mt-8 flex flex-wrap gap-2">
            <ButtonLink href={`/registrar?receita=${r.id}`} variant="accent" size="lg">
              <UtensilsCrossed size={18} /> Registrar consumo
            </ButtonLink>
            <ButtonLink href={`/receitas/${r.id}/editar`} variant="outline" size="lg">
              <Pencil size={16} /> Editar
            </ButtonLink>
            <DeleteRecipeButton id={r.id} titulo={r.titulo} />
          </div>
        </div>
      </section>

      <section className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2 className="font-display text-2xl font-light">Ingredientes</h2>
          <p className="mt-1 text-sm text-text-muted">Para a receita inteira. Estoque atual entre parênteses.</p>
          {r.ingredientes.length === 0 && (
            <p className="mt-4 text-text-muted">
              Nenhum ingrediente nesta receita. Edite para adicionar o que ela leva.
            </p>
          )}
          <ul className="mt-4 divide-y divide-line">
            {r.ingredientes.map((i) => {
              const ing = i.ingredient;
              const status =
                ing.estoqueAtual >= i.quantidade ? null : ing.estoqueAtual >= i.quantidade / r.porcoes ? "pouco" : "em falta";
              return (
                <li key={i.ingredientId} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium">{ing.nome}</p>
                    <p className="text-sm text-text-muted">
                      {fmtQtd(i.quantidade, ing.unidade)}{" "}
                      <span className="text-text-faint">({fmtQtd(ing.estoqueAtual, ing.unidade)} na despensa)</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {status && <Tag tone={status === "pouco" ? "warn" : "danger"}>{status}</Tag>}
                    <span className="text-sm text-text-muted">{fmtNum(Math.round(macrosDe(ing, i.quantidade).kcal))} kcal</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-2xl font-light">Modo de preparo</h2>
          {passos.length === 0 ? (
            <p className="mt-4 text-text-muted">Sem passos anotados ainda.</p>
          ) : (
            <ol className="mt-4 space-y-5">
              {passos.map((p, i) => (
                <li key={i} className="flex gap-4">
                  <span className="num-display w-8 shrink-0 text-3xl text-accent-strong">{i + 1}</span>
                  <p className="pt-1 leading-relaxed">{p}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
