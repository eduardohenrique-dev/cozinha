import { Download } from "lucide-react";

/** O download é servido pelo Route Handler, então basta um link comum. */
export function ExportButton() {
  return (
    <a
      href="/api/export"
      download
      className="inline-flex h-11 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line-strong bg-surface px-5 text-sm font-medium text-text transition-[transform,border-color] duration-300 ease-organic hover:border-text/50 active:scale-[0.97]"
    >
      <Download size={16} /> Exportar backup
    </a>
  );
}
