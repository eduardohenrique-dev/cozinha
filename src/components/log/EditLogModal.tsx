"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { editarConsumo } from "@/app/registrar/actions";
import { editarConsumoSchema } from "@/lib/schemas";
import { fmtNum, fmtQtd, parseNum } from "@/lib/format";
import { useDay } from "@/store/day";
import { useToast } from "@/store/toast";
import type { Refeicao } from "@/lib/day";
import type { z } from "zod";

type Valores = z.input<typeof editarConsumoSchema>;

export function EditLogModal({ refeicao, onClose }: { refeicao: Refeicao | null; onClose: () => void }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const addKcal = useDay((s) => s.addKcal);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({ resolver: zodResolver(editarConsumoSchema), mode: "onBlur" });

  useEffect(() => {
    if (refeicao) {
      reset({ id: refeicao.id, quantidade: String(refeicao.quantidade), kcal: String(Math.round(refeicao.kcal)) });
      setErro(null);
    }
  }, [refeicao, reset]);

  const qtd = parseNum(watch("quantidade") ?? 0);
  const livre = refeicao?.tipo === "livre";
  const rotulo = refeicao?.tipo === "receita" ? "Porções" : `Quantidade${refeicao?.unidade ? ` (${refeicao.unidade})` : ""}`;

  // prévia proporcional ao que já estava gravado
  const kcalPrevista =
    refeicao && refeicao.quantidade > 0 && !livre ? (refeicao.kcal / refeicao.quantidade) * qtd : parseNum(watch("kcal") ?? 0);

  const onSubmit = handleSubmit(async (valores) => {
    setErro(null);
    const r = await editarConsumo(valores);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    addKcal(r.data.kcal);
    if (r.data.alertas.length > 0) {
      push({
        title: `${r.data.alertas.length} ${r.data.alertas.length === 1 ? "item ficou" : "itens ficaram"} em falta na despensa`,
        text: r.data.alertas.map((a) => `${a.nome} (${fmtQtd(a.estoqueAtual, a.unidade)})`).join(", "),
        tone: "warn",
      });
    } else {
      push({ title: "Registro atualizado", text: "O estoque foi acertado pela diferença.", tone: "success" });
    }
    router.refresh();
    onClose();
  });

  return (
    <Modal
      open={!!refeicao}
      onClose={onClose}
      title={refeicao ? `Editar “${refeicao.nome}”` : "Editar registro"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="form-editar-log" disabled={isSubmitting}>
            {isSubmitting ? "Salvando…" : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="form-editar-log" onSubmit={onSubmit} noValidate className="space-y-4">
        <input type="hidden" {...register("id")} />
        <Field label={rotulo} error={errors.quantidade?.message}>
          <Input inputMode="decimal" {...register("quantidade")} suffix={refeicao?.unidade ?? ""} />
        </Field>

        {livre && (
          <Field label="Calorias" error={errors.kcal?.message}>
            <Input inputMode="numeric" {...register("kcal")} suffix="kcal" />
          </Field>
        )}

        <p className="text-sm text-text-muted">
          Fica em <span className="num-display text-xl text-text">{fmtNum(Math.round(kcalPrevista))}</span> kcal
          {refeicao && !livre && (
            <>
              {" "}
              (antes {fmtNum(Math.round(refeicao.kcal))}). O estoque é acertado pela diferença.
            </>
          )}
        </p>

        {erro && <p className="text-sm text-danger-strong">{erro}</p>}
      </form>
    </Modal>
  );
}
