import { fmtNum } from "@/lib/format";

/** Distribuição calórica dos macros do dia (4 kcal/g para P e C, 9 kcal/g para G). */
export function MacroBars({ proteina, carboidrato, gordura }: { proteina: number; carboidrato: number; gordura: number }) {
  const partes = [
    { label: "Proteína", g: proteina, kcal: proteina * 4, cor: "bg-primary-deep" },
    { label: "Carbo", g: carboidrato, kcal: carboidrato * 4, cor: "bg-accent" },
    { label: "Gordura", g: gordura, kcal: gordura * 9, cor: "bg-warn" },
  ];
  const total = partes.reduce((a, p) => a + p.kcal, 0);

  return (
    <div className="w-full max-w-xs">
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-bg">
        {total > 0 &&
          partes.map((p) => (
            <div key={p.label} className={`${p.cor} transition-[width] duration-700 ease-organic`} style={{ width: `${(p.kcal / total) * 100}%` }} />
          ))}
      </div>
      <ul className="mt-3 flex justify-between gap-3 text-xs text-text-muted">
        {partes.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${p.cor}`} />
            {p.label} <span className="font-medium text-text">{fmtNum(p.g)}g</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
