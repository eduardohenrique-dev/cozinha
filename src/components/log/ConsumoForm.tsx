"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { Tag } from "@/components/ui/Tag";
import { RecipePicker } from "./RecipePicker";
import { registrarConsumoAvulso, registrarConsumoReceita } from "@/app/registrar/actions";
import { consumoAvulsoSchema } from "@/lib/schemas";
import { macrosDe } from "@/lib/nutrition";
import { fmtNum, fmtQtd, parseNum } from "@/lib/format";
import { cx } from "@/lib/cx";
import { useToast } from "@/store/toast";
import { useDay } from "@/store/day";
import type { ReceitaParaConsumo } from "@/lib/recipes";
import type { IngredienteOpcao } from "@/lib/types";
import type { AlertaEstoque } from "@/lib/stock";
import type { z } from "zod";

type Modo = "receita" | "avulso";
type AvulsoForm = z.input<typeof consumoAvulsoSchema>;

export function ConsumoForm({
  receitas,
  ingredientes,
  receitaInicial,
}: {
  receitas: ReceitaParaConsumo[];
  ingredientes: IngredienteOpcao[];
  receitaInicial?: string;
}) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const addKcal = useDay((s) => s.addKcal);

  const [modo, setModo] = useState<Modo>("receita");
  const [recipeId, setRecipeId] = useState<string | null>(receitaInicial ?? null);
  const [porcoes, setPorcoes] = useState(1);
  const [erro, setErro] = useState<string | null>(null);
  const [enviandoReceita, setEnviandoReceita] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AvulsoForm>({
    resolver: zodResolver(consumoAvulsoSchema),
    mode: "onBlur",
    defaultValues: { ingredientId: "", quantidade: "", nome: "", kcal: "" },
  });

  const receita = useMemo(() => receitas.find((r) => r.id === recipeId) ?? null, [receitas, recipeId]);
  const ingredientId = watch("ingredientId");
  const ingrediente = useMemo(
    () => ingredientes.find((i) => i.id === ingredientId) ?? null,
    [ingredientes, ingredientId],
  );

  const fator = receita ? porcoes / Math.max(receita.porcoes, 1) : 0;
  const kcalReceita = receita ? receita.macrosPorcao.kcal * porcoes : 0;
  const qtd = parseNum(watch("quantidade") ?? 0);
  const kcalIngrediente = ingrediente && qtd > 0 ? macrosDe(ingrediente, qtd).kcal : 0;

  const grupos = useMemo(
    () =>
      ingredientes.reduce<Record<string, IngredienteOpcao[]>>((acc, o) => {
        (acc[o.categoria] ??= []).push(o);
        return acc;
      }, {}),
    [ingredientes],
  );

  function avisar(kcal: number, alertas: AlertaEstoque[]) {
    addKcal(kcal);
    push({ title: "Refeição registrada", text: `${fmtNum(Math.round(kcal))} kcal somadas ao dia.`, tone: "success" });
    if (alertas.length > 0) {
      push({
        title:
          alertas.length === 1 ? "Um item ficou em falta na despensa" : `${alertas.length} itens ficaram em falta na despensa`,
        text: alertas.map((a) => `${a.nome} (${fmtQtd(a.estoqueAtual, a.unidade)})`).join(", "),
        tone: "warn",
      });
    }
    router.refresh();
  }

  async function registrarReceita() {
    setErro(null);
    if (!recipeId) {
      setErro("Escolha uma receita.");
      return;
    }
    setEnviandoReceita(true);
    try {
      const r = await registrarConsumoReceita({ recipeId, porcoes });
      if (!r.ok) {
        setErro(r.erro);
        return;
      }
      avisar(r.data.kcal, r.data.alertas);
      setRecipeId(null);
      setPorcoes(1);
    } finally {
      setEnviandoReceita(false);
    }
  }

  const registrarAvulso = handleSubmit(async (valores) => {
    setErro(null);
    const r = await registrarConsumoAvulso(valores);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    avisar(r.data.kcal, r.data.alertas);
    reset({ ingredientId: "", quantidade: "", nome: "", kcal: "" });
  });

  const ocupado = isSubmitting || enviandoReceita;

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-line-strong bg-surface p-1">
        {(["receita", "avulso"] as Modo[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setModo(m);
              setErro(null);
            }}
            aria-pressed={modo === m}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ease-organic",
              modo === m ? "bg-primary-soft text-primary-deep" : "text-text-muted hover:text-text",
            )}
          >
            {m === "receita" ? "Uma receita" : "Algo avulso"}
          </button>
        ))}
      </div>

      {modo === "receita" ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            <RecipePicker receitas={receitas} value={recipeId} onChange={setRecipeId} />

            <Card alt className="p-5">
              {receita ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-text-muted">Você comeu</p>
                    <h3 className="font-display text-2xl font-light leading-tight">{receita.titulo}</h3>
                  </div>
                  <Stepper value={porcoes} onChange={setPorcoes} label={porcoes === 1 ? "porção" : "porções"} />
                  <p>
                    <span className="num-display text-4xl">{fmtNum(Math.round(kcalReceita))}</span>
                    <span className="ml-1 text-sm text-text-muted">kcal</span>
                    <span className="ml-3 text-sm text-text-muted">
                      P {fmtNum(receita.macrosPorcao.proteina * porcoes)}g · C{" "}
                      {fmtNum(receita.macrosPorcao.carboidrato * porcoes)}g · G {fmtNum(receita.macrosPorcao.gordura * porcoes)}g
                    </span>
                  </p>
                  <div>
                    <p className="mb-2 text-sm font-medium">Sai da despensa</p>
                    <ul className="space-y-1 text-sm">
                      {receita.ingredientes.map((i) => {
                        const usado = i.quantidade * fator;
                        const falta = i.estoqueAtual < usado;
                        const ficaBaixo = !falta && i.estoqueMinimo > 0 && i.estoqueAtual - usado <= i.estoqueMinimo;
                        return (
                          <li key={i.ingredientId} className="flex items-center justify-between gap-3">
                            <span className="text-text-muted">
                              <span className="text-text">{fmtQtd(usado, i.unidade)}</span> {i.nome}
                            </span>
                            {falta && <Tag tone="danger">só tem {fmtQtd(i.estoqueAtual, i.unidade)}</Tag>}
                            {ficaBaixo && <Tag tone="warn">vai ficar baixo</Tag>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[12rem] items-center justify-center text-center text-sm text-text-muted">
                  Escolha uma receita ao lado para ver as calorias e o que sai da despensa.
                </div>
              )}
            </Card>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="accent" size="lg" onClick={registrarReceita} disabled={ocupado}>
              <UtensilsCrossed size={18} /> {enviandoReceita ? "Registrando…" : "Registrar refeição"}
            </Button>
            {erro && <p className="text-sm text-danger-strong">{erro}</p>}
          </div>
        </>
      ) : (
        <form onSubmit={registrarAvulso} noValidate className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <Field
              label="Item da despensa"
              hint="Opcional. Se escolher, desconta do estoque e calcula as calorias."
              error={errors.ingredientId?.message}
            >
              <Select {...register("ingredientId")}>
                <option value="">Outro alimento (informar calorias)</option>
                {Object.entries(grupos).map(([cat, lista]) => (
                  <optgroup key={cat} label={cat}>
                    {lista.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nome}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>

            {ingrediente ? (
              <Field
                label="Quantidade"
                hint={kcalIngrediente > 0 ? `${fmtNum(Math.round(kcalIngrediente))} kcal` : "Calculado pelas calorias por 100 g/ml."}
                error={errors.quantidade?.message}
              >
                <Input inputMode="decimal" {...register("quantidade")} suffix={ingrediente.unidade} placeholder="0" />
              </Field>
            ) : (
              <>
                <Field label="O que foi" error={errors.nome?.message}>
                  <Input {...register("nome")} placeholder="Ex.: pão de queijo na padaria" />
                </Field>
                <Field label="Calorias" error={errors.kcal?.message}>
                  <Input inputMode="numeric" {...register("kcal")} suffix="kcal" placeholder="0" />
                </Field>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="accent" size="lg" disabled={ocupado}>
              <UtensilsCrossed size={18} /> {isSubmitting ? "Registrando…" : "Registrar refeição"}
            </Button>
            {erro && <p className="text-sm text-danger-strong">{erro}</p>}
          </div>
        </form>
      )}
    </div>
  );
}
