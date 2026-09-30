"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyPantryArt } from "@/components/illustrations";
import { useReveal } from "@/components/gsap/useReveal";
import { ajustarEstoque } from "@/app/despensa/actions";
import { fmtQtd, normalizar } from "@/lib/format";
import { cx } from "@/lib/cx";
import { estaBaixo } from "@/lib/nutrition";
import { useToast } from "@/store/toast";
import { IngredientModal, type ItemDespensa } from "./IngredientModal";
import { LowStockBadge } from "./LowStockBadge";
import { StockBar } from "./StockBar";

const passo = (unidade: string) => (unidade === "un" ? 1 : 100);

function Row({ item, onEdit }: { item: ItemDespensa; onEdit: () => void }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const [pending, start] = useTransition();
  const [atual, setAtual] = useState(item.estoqueAtual);
  const baixo = estaBaixo({ estoqueAtual: atual, estoqueMinimo: item.estoqueMinimo });

  function ajustar(delta: number) {
    const anterior = atual;
    setAtual(Math.max(0, anterior + delta));
    start(async () => {
      const r = await ajustarEstoque(item.id, delta);
      if (!r.ok) {
        setAtual(anterior);
        push({ title: r.erro, tone: "danger" });
        return;
      }
      setAtual(r.data.estoqueAtual);
      if (delta < 0 && r.data.abaixo && anterior > item.estoqueMinimo) {
        push({ title: `${item.nome} ficou abaixo do mínimo`, text: "Vale anotar na lista de compras.", tone: "warn" });
      }
      router.refresh();
    });
  }

  return (
    <li data-reveal className="flex items-center gap-3 py-3 sm:gap-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{item.nome}</p>
          {baixo && <LowStockBadge zerado={atual <= 0} />}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="w-full max-w-[12rem]">
            <StockBar atual={atual} minimo={item.estoqueMinimo} />
          </div>
          <p className="shrink-0 text-sm text-text-muted">
            <span className={cx("num-display mr-1 text-lg", baixo ? "text-danger-strong" : "text-text")}>{fmtQtd(atual, "").trim()}</span>
            {item.unidade}
            {item.estoqueMinimo > 0 && (
              <span className="text-text-faint"> · mín. {fmtQtd(item.estoqueMinimo, item.unidade)}</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="outline" size="icon-sm" onClick={() => ajustar(-passo(item.unidade))} disabled={pending || atual <= 0} aria-label={`Tirar ${passo(item.unidade)} ${item.unidade}`}>
          <Minus size={16} />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={() => ajustar(passo(item.unidade))} disabled={pending} aria-label={`Repor ${passo(item.unidade)} ${item.unidade}`}>
          <Plus size={16} />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Editar">
          <Pencil size={16} />
        </Button>
      </div>
    </li>
  );
}

export function PantryList({ itens, soBaixosInicial }: { itens: ItemDespensa[]; soBaixosInicial?: boolean }) {
  const [busca, setBusca] = useState("");
  const [soBaixos, setSoBaixos] = useState(Boolean(soBaixosInicial));
  const [editando, setEditando] = useState<ItemDespensa | null>(null);
  const [aberto, setAberto] = useState(false);

  const categorias = useMemo(() => [...new Set(itens.map((i) => i.categoria))].sort((a, b) => a.localeCompare(b, "pt-BR")), [itens]);
  const baixos = itens.filter(estaBaixo).length;

  const visiveis = useMemo(() => {
    const nb = normalizar(busca);
    return itens.filter((i) => (!soBaixos || estaBaixo(i)) && (!nb || normalizar(i.nome).includes(nb)));
  }, [itens, busca, soBaixos]);

  const grupos = useMemo(() => {
    const g = new Map<string, ItemDespensa[]>();
    for (const i of visiveis) g.set(i.categoria, [...(g.get(i.categoria) ?? []), i]);
    return [...g.entries()].sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [visiveis]);

  const ref = useReveal<HTMLDivElement>([visiveis.map((i) => i.id).join()]);

  const abrir = (item: ItemDespensa | null) => {
    setEditando(item);
    setAberto(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[14rem] flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar na despensa…"
            className="h-12 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-base placeholder:text-text-faint focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
        </label>
        <button
          onClick={() => setSoBaixos((v) => !v)}
          className={cx(
            "h-12 rounded-full border px-4 text-sm transition-colors duration-300 ease-organic",
            soBaixos ? "border-warn bg-warn-soft text-text" : "border-line bg-surface text-text-muted hover:text-text",
          )}
        >
          Só em falta {baixos > 0 && <span className="ml-1 rounded-full bg-warn px-1.5 text-xs text-text">{baixos}</span>}
        </button>
        <Button onClick={() => abrir(null)} className="ml-auto">
          <Plus size={18} /> Novo item
        </Button>
      </div>

      {itens.length === 0 ? (
        <EmptyState
          art={<EmptyPantryArt />}
          title="Prateleiras vazias"
          text="Cadastre o que você tem em casa. Cada receita consumida desconta daqui automaticamente."
          action={
            <Button onClick={() => abrir(null)}>
              <Plus size={18} /> Cadastrar ingrediente
            </Button>
          }
        />
      ) : visiveis.length === 0 ? (
        <EmptyState art={<EmptyPantryArt />} title={soBaixos ? "Nada em falta" : "Nada encontrado"} text={soBaixos ? "A despensa está abastecida." : "Tente outro nome."} />
      ) : (
        <div ref={ref} className="space-y-8">
          {grupos.map(([cat, lista]) => (
            <section key={cat}>
              <h2 className="font-display text-2xl font-light">{cat}</h2>
              <ul className="mt-1 divide-y divide-line">
                {lista.map((i) => (
                  <Row key={`${i.id}-${i.estoqueAtual}`} item={i} onEdit={() => abrir(i)} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <IngredientModal open={aberto} onClose={() => setAberto(false)} item={editando} categorias={categorias} />
    </div>
  );
}
