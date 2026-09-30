"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const overlay = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const ctx = gsap.context(() => {
      gsap.fromTo(overlay.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
      gsap.fromTo(
        panel.current,
        { y: 48, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.3)" },
      );
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      ctx.revert();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={overlay}
      className="fixed inset-0 z-50 flex items-end justify-center bg-text/30 sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === overlay.current && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-surface shadow-lift sm:rounded-card ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-surface/95 px-6 pb-3 pt-5 backdrop-blur-sm">
          <h2 className="font-display text-2xl font-light">{title}</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </Button>
        </div>
        <div className="px-6 pb-6">{children}</div>
        {footer && (
          <div className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-surface px-6 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
