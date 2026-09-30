import { cx } from "@/lib/cx";

/** Bloco de carregamento no estilo do app: superfície creme com brilho suave. */
export function Skeleton({ className, alt }: { className?: string; alt?: boolean }) {
  return (
    <div
      className={cx("shimmer bg-line/50", alt ? "rounded-card-alt" : "rounded-2xl", className)}
      aria-hidden
    />
  );
}

export function SkeletonCard({ className, alt }: { className?: string; alt?: boolean }) {
  return (
    <div className={cx(alt ? "rounded-card-alt" : "rounded-card", "bg-surface p-5 shadow-soft", className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-10 w-40" />
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  );
}

export function SkeletonHeader() {
  return (
    <div>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-11 w-64" />
      <Skeleton className="mt-4 h-4 w-80 max-w-full" />
    </div>
  );
}

export function SkeletonLinhas({ n = 5 }: { n?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <Skeleton className="h-11 w-12 shrink-0 rounded-[10px_4px_10px_4px]" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4" />
            <Skeleton className="mt-2 h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-12 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Aviso invisível que anuncia o carregamento a leitores de tela. */
export function Carregando({ o = "conteúdo" }: { o?: string }) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      Carregando {o}…
    </p>
  );
}
