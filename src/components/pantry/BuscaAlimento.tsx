"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fmtNum } from "@/lib/format";

export type SugestaoAlimento = {
  nome: string;
  marca: string | null;
  caloriasPor100g: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
};

/** Preenche os macros a partir do Open Food Facts. Totalmente opcional. */
export function BuscaAlimento({ termo, onEscolher }: { termo: string; onEscolher: (s: SugestaoAlimento) => void }) {
  const [resultados, setResultados] = useState<SugestaoAlimento[] | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  async function buscar() {
    const q = termo.trim();
    if (!q) {
      setAviso("Escreva o nome do ingrediente primeiro.");
      return;
    }
    setBuscando(true);
    setAviso(null);
    try {
      const res = await fetch(`/api/alimentos?q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as { resultados: SugestaoAlimento[]; erro?: string };
      setResultados(json.resultados);
      if (json.erro) setAviso(json.erro);
      else if (json.resultados.length === 0) setAviso("Nada encontrado. Preencha os valores à mão.");
    } catch {
      setAviso("A busca não respondeu. Preencha os valores à mão.");
    } finally {
      setBuscando(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-bg/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">Buscar os valores nutricionais na base do Open Food Facts.</p>
        <Button size="sm" variant="outline" onClick={buscar} disabled={buscando}>
          {buscando ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          {buscando ? "Buscando…" : "Buscar"}
        </Button>
      </div>

      {aviso && <p className="mt-2 text-xs text-text-muted">{aviso}</p>}

      {resultados && resultados.length > 0 && (
        <ul className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {resultados.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => onEscolher(s)}
                className="w-full rounded-xl border border-transparent bg-surface p-2.5 text-left transition-colors hover:border-primary"
              >
                <span className="block truncate text-sm font-medium">
                  {s.nome}
                  {s.marca && <span className="font-normal text-text-muted"> · {s.marca}</span>}
                </span>
                <span className="block text-xs text-text-muted">
                  {fmtNum(s.caloriasPor100g)} kcal · P {fmtNum(s.proteina)} · C {fmtNum(s.carboidrato)} · G {fmtNum(s.gordura)}{" "}
                  (por 100 g)
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
