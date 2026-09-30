"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { fmtQtd } from "@/lib/format";
import type { AlertaEstoque } from "@/lib/stock";

/** Aviso in-app de estoque baixo: fica no topo do dia, sem notificação push. */
export function LowStockBanner({ baixos }: { baixos: AlertaEstoque[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const icone = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { y: -12, opacity: 0, duration: 0.7, ease: "power3.out" });
      gsap.to(icone.current, { rotate: 8, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });
    return () => ctx.revert();
  }, []);

  if (baixos.length === 0) return null;

  const zerados = baixos.filter((b) => b.estoqueAtual <= 0);
  const nomes = baixos.slice(0, 3).map((b) => b.nome);
  const resto = baixos.length - nomes.length;

  return (
    <div
      ref={ref}
      role="status"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card-alt border border-warn/60 bg-warn-soft/60 px-5 py-4"
    >
      <span ref={icone} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warn/40 text-text">
        <AlertTriangle size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {baixos.length === 1 ? "1 item precisa de reposição" : `${baixos.length} itens precisam de reposição`}
          {zerados.length > 0 && <span className="text-danger-strong"> · {zerados.length} zerado{zerados.length > 1 ? "s" : ""}</span>}
        </p>
        <p className="text-sm text-text-muted">
          {nomes.map((n, i) => (
            <span key={n}>
              {i > 0 && ", "}
              {n}
            </span>
          ))}
          {resto > 0 && ` e mais ${resto}`}
          {baixos.length === 1 && ` — restam ${fmtQtd(baixos[0].estoqueAtual, baixos[0].unidade)}`}.
        </p>
      </div>
      <Link
        href="/despensa?falta=1"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-warn/30"
      >
        Ver lista <ArrowRight size={14} />
      </Link>
    </div>
  );
}
