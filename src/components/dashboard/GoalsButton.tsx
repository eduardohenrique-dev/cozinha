"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input } from "@/components/ui/Input";
import { salvarMetas } from "@/app/registrar/actions";
import { metasSchema, type MetasForm } from "@/lib/schemas";
import { parseNum } from "@/lib/format";
import { useDay } from "@/store/day";
import { useToast } from "@/store/toast";

export function GoalsButton() {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const { metaCalorica, metaAguaMl, setMetas } = useDay();
  const [open, setOpen] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MetasForm>({ resolver: zodResolver(metasSchema), mode: "onBlur" });

  function abrir() {
    reset({ metaCalorica: String(metaCalorica), metaAguaMl: String(metaAguaMl) });
    setErro(null);
    setOpen(true);
  }

  const onSubmit = handleSubmit(async (valores) => {
    setErro(null);
    const r = await salvarMetas(valores);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setMetas({ metaCalorica: parseNum(valores.metaCalorica), metaAguaMl: parseNum(valores.metaAguaMl) });
    push({ title: "Metas atualizadas", tone: "success" });
    router.refresh();
    setOpen(false);
  });

  return (
    <>
      <Button variant="ghost" size="sm" onClick={abrir}>
        <SlidersHorizontal size={16} /> Metas
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Metas do dia"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-metas" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : "Salvar"}
            </Button>
          </>
        }
      >
        <form id="form-metas" onSubmit={onSubmit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Calorias por dia" error={errors.metaCalorica?.message}>
              <Input inputMode="numeric" {...register("metaCalorica")} suffix="kcal" />
            </Field>
            <Field label="Água por dia" error={errors.metaAguaMl?.message}>
              <Input inputMode="numeric" {...register("metaAguaMl")} suffix="ml" />
            </Field>
          </div>
          {erro && <p className="mt-3 text-sm text-danger-strong">{erro}</p>}
        </form>
      </Modal>
    </>
  );
}
