"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({
  value,
  onChange,
  sugestoes,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  sugestoes: string[];
}) {
  const [texto, setTexto] = useState("");

  const add = (t: string) => {
    const v = t.trim().toLowerCase();
    if (v && !value.includes(v)) onChange([...value, v]);
    setTexto("");
  };

  const restantes = sugestoes.filter((s) => !value.includes(s)).slice(0, 8);

  return (
    <div>
      <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-2xl border border-line bg-surface px-3 py-2 transition-[border-color,box-shadow] duration-300 ease-organic focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-deep"
          >
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remover ${t}`}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(texto);
            } else if (e.key === "Backspace" && !texto && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => texto && add(texto)}
          placeholder={value.length ? "" : "café da manhã, rápido, vegetariano…"}
          className="min-w-[10ch] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-text-faint"
        />
      </div>
      {restantes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {restantes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-line px-2.5 py-1 text-xs text-text-muted transition-colors hover:border-text/30 hover:text-text"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
