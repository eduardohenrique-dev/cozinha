"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { chaveDoDia, fmtMesAno, isFuture, isToday } from "@/lib/date";
import { cx } from "@/lib/cx";

export type CelulaDia = {
  chave: string;
  data: string; // ISO
  kcal: number;
  aguaMl: number;
  temRegistro: boolean;
  doMes: boolean;
};

const DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function HistoryCalendar({
  celulas,
  mesAtual,
  mesAnterior,
  mesSeguinte,
  metaCalorica,
  selecionado,
}: {
  celulas: CelulaDia[];
  mesAtual: string;
  mesAnterior: string;
  mesSeguinte: string | null;
  metaCalorica: number;
  selecionado?: string;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/historico?mes=${mesAnterior}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-text-muted transition-colors hover:text-text"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </Link>
        <h2 className="font-display text-xl font-light">{fmtMesAno(new Date(mesAtual + "-02"))}</h2>
        {mesSeguinte ? (
          <Link
            href={`/historico?mes=${mesSeguinte}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-text-muted transition-colors hover:text-text"
            aria-label="Próximo mês"
          >
            <ChevronRight size={18} />
          </Link>
        ) : (
          <span className="h-9 w-9" aria-hidden />
        )}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS.map((d, i) => (
          <span key={i} className="pb-1 text-xs font-medium text-text-faint">
            {d}
          </span>
        ))}

        {celulas.map((c) => {
          const data = new Date(c.data);
          const futuro = isFuture(data) && !isToday(data);
          const pct = metaCalorica > 0 ? Math.min(1, c.kcal / metaCalorica) : 0;
          const ativo = selecionado === c.chave;

          const conteudo = (
            <>
              <span className="relative z-10">{data.getDate()}</span>
              {c.temRegistro && (
                <span
                  className="absolute inset-x-1 bottom-1 h-1 rounded-full bg-accent"
                  style={{ opacity: 0.35 + pct * 0.65 }}
                  aria-hidden
                />
              )}
            </>
          );

          const classe = cx(
            "relative flex aspect-square items-center justify-center rounded-xl text-sm transition-colors duration-300 ease-organic",
            !c.doMes && "opacity-35",
            futuro && "text-text-faint",
            ativo && "bg-primary text-text font-semibold",
            !ativo && isToday(data) && "ring-1 ring-accent",
            !ativo && !futuro && c.doMes && "hover:bg-primary-soft",
          );

          if (futuro || !c.doMes) {
            return (
              <span key={c.chave} className={classe} aria-hidden={!c.doMes}>
                {conteudo}
              </span>
            );
          }

          return (
            <Link
              key={c.chave}
              href={`/historico?dia=${c.chave}&mes=${mesAtual}`}
              className={classe}
              aria-label={`${data.getDate()} — ${Math.round(c.kcal)} kcal, ${c.aguaMl} ml`}
              aria-current={ativo ? "date" : undefined}
            >
              {conteudo}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
