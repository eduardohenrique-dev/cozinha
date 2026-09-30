"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { zerarAguaDoDia } from "@/app/registrar/actions";
import { fmtNum } from "@/lib/format";
import { useDay } from "@/store/day";
import { useToast } from "@/store/toast";

/** Zera a água do dia. Confirma antes porque apaga todos os copos de uma vez. */
export function ResetWaterButton({ copos }: { copos: number }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const { aguaMl, addAgua } = useDay();
  const [aberto, setAberto] = useState(false);
  const [pending, start] = useTransition();

  if (aguaMl <= 0) return null;

  function zerar() {
    start(async () => {
      const r = await zerarAguaDoDia();
      if (!r.ok) {
        push({ title: r.erro, tone: "danger" });
        setAberto(false);
        return;
      }
      addAgua(-r.data.ml);
      push({
        title: "Água do dia zerada",
        text: `${r.data.apagados} ${r.data.apagados === 1 ? "registro apagado" : "registros apagados"}.`,
      });
      router.refresh();
      setAberto(false);
    });
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setAberto(true)} aria-label="Reiniciar a água de hoje">
        <RotateCcw size={15} /> Reiniciar
      </Button>

      <Modal
        open={aberto}
        onClose={() => setAberto(false)}
        title="Reiniciar a água de hoje?"
        footer={
          <>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={zerar} disabled={pending}>
              {pending ? "Zerando…" : "Zerar"}
            </Button>
          </>
        }
      >
        <p className="text-text-muted">
          O contador volta para zero e {copos === 1 ? "o registro de hoje some" : `os ${copos} registros de hoje somem`}, somando{" "}
          <span className="num-display text-lg text-text">{fmtNum(aguaMl)}</span> ml. As refeições não são afetadas, e os
          outros dias continuam no histórico.
        </p>
      </Modal>
    </>
  );
}
