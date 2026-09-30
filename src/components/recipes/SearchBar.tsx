"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, ChevronDown } from "lucide-react";
import { cx } from "@/lib/cx";

export type IngredienteFiltro = { id: string; nome: string; emEstoque: boolean };

export function SearchBar({
  tags,
  ingredientes,
  prontas,
  placeholder,
}: {
  tags: string[];
  ingredientes: IngredienteFiltro[];
  prontas: number;
  placeholder: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const tag = params.get("tag") ?? "";
  const ingrediente = params.get("ingrediente") ?? "";
  const daParaFazer = params.get("daParaFazer") === "1";
  const [valor, setValor] = useState(q);

  useEffect(() => setValor(q), [q]);

  const aplicar = (mudancas: Record<string, string | null>) => {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(mudancas)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (valor === q) return;
    const t = setTimeout(() => {
      const p = new URLSearchParams(params.toString());
      if (valor) p.set("q", valor);
      else p.delete("q");
      router.replace(`${pathname}?${p.toString()}`, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [valor, q, params, pathname, router]);

  const temFiltro = Boolean(q || tag || ingrediente || daParaFazer);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <label className="relative min-w-[14rem] flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-faint" />
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={placeholder}
            aria-label="Buscar receitas"
            className="h-12 w-full rounded-full border border-line-strong bg-surface pl-11 pr-11 text-base placeholder:text-text-faint focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          />
          {valor && (
            <button
              onClick={() => setValor("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-faint hover:text-text"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </label>

        <button
          onClick={() => aplicar({ daParaFazer: daParaFazer ? null : "1" })}
          aria-pressed={daParaFazer}
          className={cx(
            "h-12 shrink-0 rounded-full border px-4 text-sm transition-colors duration-300 ease-organic",
            daParaFazer
              ? "border-primary bg-primary-soft text-primary-deep"
              : "border-line-strong bg-surface text-text-muted hover:text-text",
          )}
        >
          Dá para fazer
          {prontas > 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-text">{prontas}</span>}
        </button>

        <div className="relative shrink-0">
          <select
            value={ingrediente}
            onChange={(e) => aplicar({ ingrediente: e.target.value || null })}
            aria-label="Filtrar por ingrediente"
            className={cx(
              "h-12 appearance-none rounded-full border bg-surface pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15",
              ingrediente ? "border-primary text-text" : "border-line-strong text-text-muted",
            )}
          >
            <option value="">Qualquer ingrediente</option>
            {ingredientes.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nome}
                {i.emEstoque ? " ✓" : ""}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted" />
        </div>
      </div>

      {tags.length > 0 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => aplicar({ tag: t === tag ? null : t })}
              aria-pressed={t === tag}
              className={cx(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-300 ease-organic",
                t === tag
                  ? "border-primary bg-primary-soft text-primary-deep"
                  : "border-line-strong bg-surface text-text-muted hover:text-text",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {temFiltro && (
        <button
          onClick={() => aplicar({ q: null, tag: null, ingrediente: null, daParaFazer: null })}
          className="text-xs text-text-muted underline underline-offset-2 hover:text-text"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}
