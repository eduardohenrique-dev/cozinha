import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LowStockBadge } from "@/components/pantry/LowStockBadge";
import { fmtQtd } from "@/lib/format";
import type { AlertaEstoque } from "@/lib/stock";

export function Alerts({ baixos }: { baixos: AlertaEstoque[] }) {
  return (
    <Card alt className="flex h-full flex-col p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-light">Despensa</h2>
        <Link href="/despensa" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text">
          Ver tudo <ArrowRight size={14} />
        </Link>
      </div>

      {baixos.length === 0 ? (
        <p className="mt-4 text-sm text-text-muted">Tudo abastecido. Nenhum item abaixo do mínimo.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-text-muted">
            {baixos.length === 1 ? "1 item precisa" : `${baixos.length} itens precisam`} de reposição.
          </p>
          <ul className="mt-4 divide-y divide-line">
            {baixos.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-medium">{b.nome}</span>
                  <LowStockBadge zerado={b.estoqueAtual <= 0} />
                </div>
                <span className="shrink-0 text-sm text-text-muted">
                  {fmtQtd(b.estoqueAtual, b.unidade)} <span className="text-text-faint">/ mín. {fmtQtd(b.estoqueMinimo, b.unidade)}</span>
                </span>
              </li>
            ))}
          </ul>
          {baixos.length > 6 && <p className="mt-2 text-xs text-text-faint">e mais {baixos.length - 6}…</p>}
        </>
      )}
    </Card>
  );
}
