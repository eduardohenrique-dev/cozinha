"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { PhotoDrop } from "./PhotoDrop";
import { TagInput } from "./TagInput";
import { IngredientRows } from "./IngredientRows";
import { salvarReceita } from "@/app/receitas/actions";
import { receitaSchema, type ReceitaForm as Valores } from "@/lib/schemas";
import { porPorcao, somaMacros } from "@/lib/nutrition";
import { fmtNum, parseNum } from "@/lib/format";
import { useToast } from "@/store/toast";
import type { IngredienteOpcao } from "@/lib/types";

type Props = {
  ingredientes: IngredienteOpcao[];
  tagsSugeridas: string[];
  inicial?: Valores & { id: string };
};

export function RecipeForm({ ingredientes, tagsSugeridas, inicial }: Props) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    resolver: zodResolver(receitaSchema),
    mode: "onBlur",
    defaultValues: inicial ?? {
      titulo: "",
      fotoUrl: null,
      modoPreparo: "",
      porcoes: 2,
      tags: [],
      itens: [{ ingredientId: "", quantidade: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "itens" });
  const itens = watch("itens");
  const porcoesRaw = watch("porcoes");

  const porId = useMemo(() => new Map(ingredientes.map((i) => [i.id, i])), [ingredientes]);
  const nPorcoes = Math.max(1, Math.round(parseNum(porcoesRaw ?? 1)) || 1);
  const total = somaMacros(
    (itens ?? [])
      .map((l) => ({ ingredient: porId.get(l.ingredientId), quantidade: parseNum(l.quantidade) }))
      .filter((x): x is { ingredient: IngredienteOpcao; quantidade: number } => !!x.ingredient && x.quantidade > 0),
  );
  const porcao = porPorcao(total, nPorcoes);

  const onSubmit = handleSubmit(async (valores) => {
    setErro(null);
    const r = await salvarReceita({ ...valores, id: inicial?.id });
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    push({ title: inicial ? "Receita atualizada" : "Receita guardada no caderno", tone: "success" });
    router.push(`/receitas/${r.data.id}`);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="space-y-5">
        <Controller
          control={control}
          name="fotoUrl"
          render={({ field }) => <PhotoDrop value={field.value ?? null} onChange={field.onChange} />}
        />
        <Field label="Nome da receita" error={errors.titulo?.message}>
          <Input {...register("titulo")} placeholder="Ex.: Panqueca de banana" />
        </Field>
        <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4">
          <Field label="Porções" error={errors.porcoes?.message}>
            <Input inputMode="numeric" {...register("porcoes")} />
          </Field>
          <Field label="Tags">
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput value={field.value ?? []} onChange={field.onChange} sugestoes={tagsSugeridas} />
              )}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 font-display text-2xl font-light">Ingredientes</h2>
          <IngredientRows
            campos={fields}
            valores={itens ?? []}
            register={register}
            onAdd={() => append({ ingredientId: "", quantidade: "" })}
            onRemove={remove}
            opcoes={ingredientes}
            erro={errors.itens?.message ?? errors.itens?.root?.message}
          />
        </section>
        <Field label="Modo de preparo" hint="Um passo por linha." error={errors.modoPreparo?.message}>
          <Textarea rows={8} {...register("modoPreparo")} placeholder="Amasse as bananas…" />
        </Field>
      </div>

      <div className="sticky bottom-[6.25rem] z-20 md:bottom-4 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card-alt border border-line bg-surface/95 px-5 py-4 shadow-lift backdrop-blur-sm">
          <div className="flex items-baseline gap-4">
            <p>
              <span className="num-display text-3xl">{fmtNum(Math.round(porcao.kcal))}</span>
              <span className="ml-1 text-sm text-text-muted">kcal / porção</span>
            </p>
            <p className="hidden text-sm text-text-muted sm:block">
              P {fmtNum(porcao.proteina)}g · C {fmtNum(porcao.carboidrato)}g · G {fmtNum(porcao.gordura)}g
            </p>
          </div>
          <div className="flex items-center gap-3">
            {erro && <p className="text-sm text-danger-strong">{erro}</p>}
            <ButtonLink href={inicial ? `/receitas/${inicial.id}` : "/receitas"} variant="ghost">
              Cancelar
            </ButtonLink>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : inicial ? "Salvar alterações" : "Guardar receita"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
