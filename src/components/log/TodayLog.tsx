"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyLogArt, EmptyPhotoArt } from "@/components/illustrations";
import { EditLogModal } from "./EditLogModal";
import { excluirConsumo } from "@/app/registrar/actions";
import { periodoDoDia, fmtHoraCurta } from "@/lib/date";
import { fmtNum, fmtQtd } from "@/lib/format";
import { useDay } from "@/store/day";
import { useToast } from "@/store/toast";
import type { Refeicao } from "@/lib/day";

const ORDEM = ["Café da manhã", "Almoço", "Lanche", "Jantar"];

export function TodayLog({
  refeicoes,
  titulo = "Refeições de hoje",
  somenteLeitura,
}: {
  refeicoes: Refeicao[];
  titulo?: string;
  somenteLeitura?: boolean;
}) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const addKcal = useDay((s) => s.addKcal);
  const [pending, start] = useTransition();
  const [editando, setEditando] = useState<Refeicao | null>(null);

  const grupos = ORDEM.map((p) => [p, refeicoes.filter((r) => periodoDoDia(new Date(r.hora)) === p)] as const).filter(
    ([, l]) => l.length > 0,
  );

  function apagar(r: Refeicao) {
    start(async () => {
      const res = await excluirConsumo(r.id);
      if (!res.ok) {
        push({ title: res.erro, tone: "danger" });
        return;
      }
      addKcal(-res.data.kcal);
      push({ title: "Registro apagado", text: res.data.devolvido ? "Os ingredientes voltaram para a despensa." : undefined });
      router.refresh();
    });
  }

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-light">{titulo}</h2>
        {refeicoes.length > 0 && (
          <p className="text-sm text-text-muted">
            <span className="num-display text-xl text-text">
              {fmtNum(Math.round(refeicoes.reduce((a, r) => a + r.kcal, 0)))}
            </span>{" "}
            kcal
          </p>
        )}
      </div>

      {refeicoes.length === 0 ? (
        <EmptyState
          art={<EmptyLogArt />}
          title="Prato limpo"
          text="Nenhuma refeição registrada aqui ainda. Quando você registrar, ela aparece separada por horário do dia."
        />
      ) : (
        <div className="mt-4 space-y-6">
          {grupos.map(([periodo, lista]) => (
            <div key={periodo}>
              <p className="text-xs font-medium uppercase tracking-wide text-text-faint">{periodo}</p>
              <ul className="mt-2 divide-y divide-line">
                {lista.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 py-2.5">
                    <span className="h-11 w-12 shrink-0 overflow-hidden rounded-[10px_4px_10px_4px] bg-bg">
                      {r.thumbUrl ? <img src={r.thumbUrl} alt="" className="h-full w-full object-cover" /> : <EmptyPhotoArt />}
                    </span>
                    <div className="min-w-0 flex-1">
                      {r.recipeId ? (
                        <Link href={`/receitas/${r.recipeId}`} className="block truncate font-medium hover:underline">
                          {r.nome}
                        </Link>
                      ) : (
                        <p className="truncate font-medium">{r.nome}</p>
                      )}
                      <p className="text-sm text-text-muted">
                        {fmtHoraCurta(new Date(r.hora))} ·{" "}
                        {r.tipo === "receita"
                          ? `${fmtNum(r.quantidade, 1)} ${r.quantidade === 1 ? "porção" : "porções"}`
                          : r.unidade
                            ? fmtQtd(r.quantidade, r.unidade)
                            : "avulso"}
                      </p>
                    </div>
                    <p className="num-display text-xl">{fmtNum(Math.round(r.kcal))}</p>
                    {!somenteLeitura && (
                      <div className="flex shrink-0 items-center">
                        <button
                          onClick={() => setEditando(r)}
                          className="p-1 text-text-faint hover:text-text"
                          aria-label={`Editar ${r.nome}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => apagar(r)}
                          disabled={pending}
                          className="p-1 text-text-faint hover:text-danger-strong"
                          aria-label={`Apagar ${r.nome}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {!somenteLeitura && <EditLogModal refeicao={editando} onClose={() => setEditando(null)} />}
    </section>
  );
}
