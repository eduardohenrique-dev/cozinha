"use client";

import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/store/toast";

export function PhotoDrop({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const push = useToast((s) => s.push);

  async function enviar(file: File) {
    if (!file.type.startsWith("image/")) {
      push({ title: "Só imagens, por favor.", tone: "danger" });
      return;
    }
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; erro?: string };
      if (!res.ok || !json.url) throw new Error(json.erro ?? "Falha no upload");
      onChange(json.url);
    } catch (e) {
      push({ title: "Não deu para enviar a foto", text: e instanceof Error ? e.message : undefined, tone: "danger" });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) enviar(f);
      }}
      className={`relative aspect-[4/3] overflow-hidden rounded-card border-2 transition-[border-color,background-color] duration-300 ease-organic ${
        drag ? "border-primary bg-primary-soft/50" : value ? "border-transparent" : "border-dashed border-line bg-surface"
      }`}
    >
      {value ? (
        <img src={value} alt="" className="h-full w-full object-cover" />
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-text-muted"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
            <ImagePlus size={24} />
          </span>
          <span className="text-sm leading-relaxed">
            Arraste uma foto aqui
            <br />
            ou <span className="underline decoration-primary decoration-2 underline-offset-2">escolha do aparelho</span>
          </span>
        </button>
      )}

      {value && !enviando && (
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => input.current?.click()}>
            <RefreshCw size={14} /> Trocar
          </Button>
          <Button size="icon-sm" variant="danger" onClick={() => onChange(null)} aria-label="Remover foto">
            <Trash2 size={14} />
          </Button>
        </div>
      )}

      {enviando && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 text-sm text-text-muted">
          <span className="animate-pulse">Enviando foto…</span>
        </div>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) enviar(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
