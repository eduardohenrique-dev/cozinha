"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { excluirReceita } from "@/app/receitas/actions";

export function DeleteRecipeButton({ id, titulo }: { id: string; titulo: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <Trash2 size={16} /> Excluir
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Excluir receita?"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" disabled={pending} onClick={() => start(() => excluirReceita(id))}>
              {pending ? "Excluindo…" : "Excluir"}
            </Button>
          </>
        }
      >
        <p className="text-text-muted">
          “{titulo}” sai do caderno e a foto é apagada. Os registros de consumo antigos continuam valendo.
        </p>
      </Modal>
    </>
  );
}
