"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { excluirIngrediente, salvarIngrediente } from "@/app/despensa/actions";
import { BuscaAlimento, type SugestaoAlimento } from "./BuscaAlimento";
import { ingredienteSchema, type IngredienteForm } from "@/lib/schemas";
import { useToast } from "@/store/toast";

export type ItemDespensa = {
  id: string;
  nome: string;
  unidade: string;
  categoria: string;
  caloriasPor100g: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  pesoUnidadeG: number | null;
  receitas: string[];
};

const vazio: IngredienteForm = {
  nome: "",
  categoria: "",
  unidade: "g",
  caloriasPor100g: "",
  proteina: "",
  carboidrato: "",
  gordura: "",
  estoqueAtual: "",
  estoqueMinimo: "",
  pesoUnidadeG: "",
};

const deItem = (i: ItemDespensa): IngredienteForm => ({
  id: i.id,
  nome: i.nome,
  categoria: i.categoria,
  unidade: (i.unidade as "g" | "ml" | "un") ?? "g",
  caloriasPor100g: String(i.caloriasPor100g),
  proteina: String(i.proteina),
  carboidrato: String(i.carboidrato),
  gordura: String(i.gordura),
  estoqueAtual: String(i.estoqueAtual),
  estoqueMinimo: String(i.estoqueMinimo),
  pesoUnidadeG: i.pesoUnidadeG != null ? String(i.pesoUnidadeG) : "",
});

export function IngredientModal({
  open,
  onClose,
  item,
  categorias,
}: {
  open: boolean;
  onClose: () => void;
  item: ItemDespensa | null;
  categorias: string[];
}) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [pendingDel, startDel] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IngredienteForm>({
    resolver: zodResolver(ingredienteSchema),
    defaultValues: vazio,
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      reset(item ? deItem(item) : vazio);
      setErro(null);
      setConfirmando(false);
    }
  }, [open, item, reset]);

  const unidade = watch("unidade");
  const nomeAtual = watch("nome");
  const porUnidade = unidade === "un";

  function aplicarSugestao(s: SugestaoAlimento) {
    setValue("caloriasPor100g", String(s.caloriasPor100g), { shouldValidate: true });
    setValue("proteina", String(s.proteina), { shouldValidate: true });
    setValue("carboidrato", String(s.carboidrato), { shouldValidate: true });
    setValue("gordura", String(s.gordura), { shouldValidate: true });
    push({ title: "Valores preenchidos", text: s.nome, tone: "success" });
  }

  const onSubmit = handleSubmit(async (valores) => {
    setErro(null);
    const r = await salvarIngrediente({ ...valores, id: item?.id });
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    push({ title: item ? "Item atualizado" : "Item guardado na despensa", tone: "success" });
    router.refresh();
    onClose();
  });

  function excluir() {
    if (!item) return;
    startDel(async () => {
      const r = await excluirIngrediente(item.id);
      if (!r.ok) {
        setErro(r.erro);
        setConfirmando(false);
        return;
      }
      const n = r.data.receitas.length;
      push({
        title: `${item.nome} saiu da despensa`,
        text: n > 0 ? `Também saiu de ${n} ${n === 1 ? "receita" : "receitas"}.` : undefined,
      });
      router.refresh();
      onClose();
    });
  }

  const ocupado = isSubmitting || pendingDel;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? item.nome : "Novo ingrediente"}
      footer={
        <>
          {item &&
            (confirmando ? (
              <Button variant="danger" className="mr-auto" onClick={excluir} disabled={ocupado}>
                {pendingDel ? "Excluindo…" : "Confirmar exclusão"}
              </Button>
            ) : (
              <Button variant="ghost" className="mr-auto" onClick={() => setConfirmando(true)}>
                <Trash2 size={16} /> Excluir
              </Button>
            ))}
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-ingrediente" disabled={ocupado}>
            {isSubmitting ? "Salvando…" : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="form-ingrediente" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Nome" error={errors.nome?.message}>
          <Input {...register("nome")} placeholder="Ex.: Grão-de-bico" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria" error={errors.categoria?.message}>
            <Input list="categorias-despensa" {...register("categoria")} placeholder="Grãos" />
            <datalist id="categorias-despensa">
              {categorias.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Unidade" error={errors.unidade?.message}>
            <Select {...register("unidade")}>
              <option value="g">gramas (g)</option>
              <option value="ml">mililitros (ml)</option>
              <option value="un">unidades (un)</option>
            </Select>
          </Field>
        </div>

        {porUnidade && (
          <Field
            label="Peso de uma unidade"
            hint="Para converter as calorias por 100 g. Um ovo tem uns 50 g."
            error={errors.pesoUnidadeG?.message}
          >
            <Input inputMode="decimal" {...register("pesoUnidadeG")} suffix="g" />
          </Field>
        )}

        <fieldset className="rounded-2xl border border-line p-4">
          <legend className="px-2 text-sm font-medium">Por 100 {porUnidade ? "g" : unidade}</legend>
          <BuscaAlimento termo={nomeAtual ?? ""} onEscolher={aplicarSugestao} />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="kcal" error={errors.caloriasPor100g?.message}>
              <Input inputMode="decimal" {...register("caloriasPor100g")} />
            </Field>
            <Field label="Proteína" error={errors.proteina?.message}>
              <Input inputMode="decimal" {...register("proteina")} suffix="g" />
            </Field>
            <Field label="Carbo" error={errors.carboidrato?.message}>
              <Input inputMode="decimal" {...register("carboidrato")} suffix="g" />
            </Field>
            <Field label="Gordura" error={errors.gordura?.message}>
              <Input inputMode="decimal" {...register("gordura")} suffix="g" />
            </Field>
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Estoque atual" error={errors.estoqueAtual?.message}>
            <Input inputMode="decimal" {...register("estoqueAtual")} suffix={unidade} />
          </Field>
          <Field
            label="Estoque mínimo"
            hint="Abaixo disso, avisa. Zero desliga o alerta."
            error={errors.estoqueMinimo?.message}
          >
            <Input inputMode="decimal" {...register("estoqueMinimo")} suffix={unidade} />
          </Field>
        </div>

        {item && confirmando && (
          <div className="rounded-2xl border border-danger/40 bg-danger-soft/40 p-4 text-sm">
            <p className="font-medium">Tirar “{item.nome}” da despensa?</p>
            {item.receitas.length > 0 ? (
              <>
                <p className="mt-1 text-text-muted">
                  Ele também sai de {item.receitas.length}{" "}
                  {item.receitas.length === 1 ? "receita, que passa" : "receitas, que passam"} a ser calculada
                  {item.receitas.length === 1 ? "" : "s"} sem ele:
                </p>
                <ul className="mt-2 list-inside list-disc text-text-muted">
                  {item.receitas.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-1 text-text-muted">Não está em nenhuma receita.</p>
            )}
          </div>
        )}

        {erro && <p className="text-sm text-danger-strong">{erro}</p>}
      </form>
    </Modal>
  );
}
