"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Tag } from "@/components/ui/Tag";
import { EmptyPhotoArt } from "@/components/illustrations";
import { fmtNum } from "@/lib/format";
import type { ReceitaCard } from "@/lib/recipes";

export function RecipeCard({ r, alt }: { r: ReceitaCard; alt?: boolean }) {
  const card = useRef<HTMLAnchorElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = card.current;
    const im = img.current;
    if (!el || !im || !window.matchMedia("(hover: hover)").matches) return;

    const scale = gsap.quickTo(im, "scale", { duration: 0.6, ease: "power3.out" });
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3.out" });
    gsap.set(el, { transformPerspective: 900 });

    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width - 0.5;
      const py = (e.clientY - b.top) / b.height - 0.5;
      rx(-py * 5);
      ry(px * 6);
    };
    const enter = () => scale(1.045);
    const leave = () => {
      scale(1);
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const radius = alt ? "rounded-card-alt" : "rounded-card";
  const completa = r.itens > 0 && r.faltando === 0;

  return (
    <Link
      ref={card}
      href={`/receitas/${r.id}`}
      data-reveal
      className={`group block ${radius} bg-surface p-2 shadow-soft transition-shadow duration-500 ease-organic hover:shadow-lift`}
    >
      <div className={`relative aspect-[4/3] overflow-hidden ${alt ? "rounded-[6px_20px_6px_20px]" : "rounded-[20px_6px_20px_6px]"} bg-bg`}>
        <div ref={img} className="h-full w-full will-change-transform">
          {r.thumbUrl ? (
            <img src={r.thumbUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <EmptyPhotoArt />
          )}
        </div>
        <span className="absolute left-3 top-3">
          {r.itens === 0 ? (
            <Tag tone="neutral">sem ingredientes</Tag>
          ) : completa ? (
            <Tag tone="sage">dá para fazer</Tag>
          ) : (
            <Tag tone="neutral">
              faltam {r.faltando} {r.faltando === 1 ? "item" : "itens"}
            </Tag>
          )}
        </span>
      </div>
      <div className="px-3 pb-3 pt-4">
        <h3 className="font-display text-xl font-normal leading-tight">{r.titulo}</h3>
        <p className="mt-1.5 text-sm text-text-muted">
          <span className="num-display text-lg text-text">{fmtNum(Math.round(r.kcalPorcao))}</span> kcal por porção ·{" "}
          {r.porcoes} {r.porcoes === 1 ? "porção" : "porções"}
        </p>
        {r.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {r.tags.slice(0, 3).map((t) => (
              <Tag key={t} tone="neutral">
                {t}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
