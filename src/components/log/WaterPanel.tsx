"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Droplets, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ResetWaterButton } from "./ResetWaterButton";
import { excluirAgua, registrarAgua } from "@/app/registrar/actions";
import { fmtHora, fmtNum, parseNum } from "@/lib/format";
import { useDay } from "@/store/day";
import { useToast } from "@/store/toast";
import type { EntradaAgua } from "@/lib/day";

/* Copo com nível que enche; a gota cai ao registrar. */
function Glass({ pct, gotaKey }: { pct: number; gotaKey: number }) {
  const agua = useRef<SVGRectElement>(null);
  const gota = useRef<SVGPathElement>(null);
  const primeira = useRef(true);

  useEffect(() => {
    const alturaMax = 150;
    const y = 30 + alturaMax * (1 - pct);
    gsap.to(agua.current, {
      attr: { y, height: alturaMax * pct },
      duration: primeira.current ? 1.2 : 0.9,
      ease: primeira.current ? "power2.out" : "elastic.out(1, 0.55)",
    });
    primeira.current = false;
  }, [pct]);

  useEffect(() => {
    if (gotaKey === 0) return;
    const nivel = 30 + 150 * (1 - pct);
    gsap.fromTo(
      gota.current,
      { y: -30, opacity: 1, scaleY: 1, transformOrigin: "50% 100%" },
      { y: nivel - 28, duration: 0.55, ease: "power2.in", onComplete: () => gsap.to(gota.current, { opacity: 0, scaleY: 0.2, duration: 0.25 }) },
    );
  }, [gotaKey, pct]);

  return (
    <svg viewBox="0 0 160 200" className="h-44 w-auto" aria-hidden>
      <defs>
        <clipPath id="copo">
          <path d="M34 30 H126 L118 180 Q80 190 42 180 Z" />
        </clipPath>
      </defs>
      <ellipse cx="80" cy="192" rx="46" ry="6" fill="#3D3833" opacity=".07" />
      <rect ref={agua} x="30" y="180" width="100" height="0" fill="#9CAF88" opacity=".55" clipPath="url(#copo)" />
      <path d="M34 30 H126 L118 180 Q80 190 42 180 Z" fill="none" stroke="#3D3833" strokeOpacity=".35" strokeWidth="3" strokeLinejoin="round" />
      <path d="M40 40 L36 160" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" />
      <path ref={gota} d="M80 6 C72 16 70 22 76 26 C80 29 84 26 84 22 C84 18 82 12 80 6 Z" fill="#78906A" opacity="0" />
    </svg>
  );
}

export function WaterPanel({ entradas, compacto }: { entradas: EntradaAgua[]; compacto?: boolean }) {
  const router = useRouter();
  const push = useToast((s) => s.push);
  const { aguaMl, metaAguaMl, addAgua } = useDay();
  const [pending, start] = useTransition();
  const [manual, setManual] = useState("");
  const [gota, setGota] = useState(0);

  const pct = Math.min(1, metaAguaMl > 0 ? aguaMl / metaAguaMl : 0);
  const restante = Math.max(0, metaAguaMl - aguaMl);

  function beber(ml: number) {
    if (!(ml > 0)) return;
    addAgua(ml);
    setGota((g) => g + 1);
    start(async () => {
      const r = await registrarAgua(ml);
      if (!r.ok) {
        addAgua(-ml);
        push({ title: r.erro, tone: "danger" });
        return;
      }
      if (r.data.totalMl >= metaAguaMl && r.data.totalMl - ml < metaAguaMl) {
        push({ title: "Meta de água batida!", text: "Corpo hidratado, cabeça leve.", tone: "success" });
      }
      setManual("");
      router.refresh();
    });
  }

  function remover(e: EntradaAgua) {
    addAgua(-e.ml);
    start(async () => {
      const r = await excluirAgua(e.id);
      if (!r.ok) {
        addAgua(e.ml);
        push({ title: r.erro, tone: "danger" });
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className={compacto ? "" : "grid gap-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]"}>
      <Card className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-center sm:gap-8">
        <Glass pct={pct} gotaKey={gota} />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-text-muted">Hoje</p>
          <p className="num-display text-6xl">
            {fmtNum(aguaMl)}
            <span className="ml-1 text-2xl not-italic text-text-faint">ml</span>
          </p>
          <p className="mt-2 text-sm text-text-muted">
            {restante > 0 ? `Faltam ${fmtNum(restante)} ml para ${fmtNum(metaAguaMl)} ml.` : "Meta do dia batida."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            <Button size="lg" onClick={() => beber(250)} disabled={pending}>
              <Droplets size={18} /> +250 ml
            </Button>
            <Button size="lg" variant="soft" onClick={() => beber(500)} disabled={pending}>
              +500 ml
            </Button>
          </div>
          <form
            className="mt-3 flex max-w-xs gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              beber(parseNum(manual));
            }}
          >
            <Input inputMode="numeric" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Outra quantidade" suffix="ml" />
            <Button type="submit" variant="outline" disabled={pending || !(parseNum(manual) > 0)}>
              Somar
            </Button>
          </form>
          <div className="mt-2 flex justify-center sm:justify-start">
            <ResetWaterButton copos={entradas.length} />
          </div>
        </div>
      </Card>

      {!compacto && (
        <div>
          <h3 className="font-display text-2xl font-light">Copos de hoje</h3>
          {entradas.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">Nada registrado ainda. Começa com um copo.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {entradas.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-text-muted">{fmtHora(new Date(e.hora))}</span>
                  <span className="num-display text-xl">{fmtNum(e.ml)} ml</span>
                  <button onClick={() => remover(e)} className="text-text-faint hover:text-danger-strong" aria-label="Remover" disabled={pending}>
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
