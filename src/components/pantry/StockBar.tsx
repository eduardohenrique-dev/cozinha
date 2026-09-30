export function StockBar({ atual, minimo }: { atual: number; minimo: number }) {
  const referencia = Math.max(minimo * 2, atual, 1);
  const pct = Math.max(0, Math.min(1, atual / referencia));
  const marca = Math.min(1, minimo / referencia);
  const cor = minimo <= 0 ? "bg-primary/40" : atual <= 0 ? "bg-danger" : atual <= minimo ? "bg-warn" : "bg-primary";

  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg">
      <div className={`h-full rounded-full ${cor} transition-[width] duration-700 ease-organic`} style={{ width: `${pct * 100}%` }} />
      {minimo > 0 && (
        <span className="absolute top-0 h-full w-px bg-text/30" style={{ left: `${marca * 100}%` }} aria-hidden />
      )}
    </div>
  );
}
