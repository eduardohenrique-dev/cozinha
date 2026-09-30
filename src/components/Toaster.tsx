"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { X, AlertTriangle, Check } from "lucide-react";
import { useToast, type Toast } from "@/store/toast";

function Item({ t, onClose }: { t: Toast; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tw = gsap.fromTo(
      el,
      { x: 32, opacity: 0, rotate: 1.5 },
      { x: 0, opacity: 1, rotate: 0, duration: 0.7, ease: "expo.out" },
    );
    return () => {
      tw.kill();
    };
  }, []);

  const tone = t.tone ?? "default";
  const ring =
    tone === "warn" ? "border-warn/60" : tone === "danger" ? "border-danger/60" : tone === "success" ? "border-primary/60" : "border-line";

  return (
    <div
      ref={ref}
      role="status"
      className={`pointer-events-auto flex w-[min(92vw,22rem)] items-start gap-3 rounded-card-alt border bg-surface p-4 shadow-lift ${ring}`}
    >
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          tone === "warn" ? "bg-warn-soft text-text" : tone === "danger" ? "bg-danger-soft text-danger-strong" : "bg-primary-soft text-primary-deep"
        }`}
      >
        {tone === "warn" || tone === "danger" ? <AlertTriangle size={14} /> : <Check size={14} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{t.title}</p>
        {t.text && <p className="mt-0.5 text-sm text-text-muted">{t.text}</p>}
      </div>
      <button onClick={onClose} className="text-text-faint hover:text-text" aria-label="Fechar aviso">
        <X size={16} />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6">
      {toasts.map((t) => (
        <Item key={t.id} t={t} onClose={() => dismiss(t.id)} />
      ))}
    </div>
  );
}
