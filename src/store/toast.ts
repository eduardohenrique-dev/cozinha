import { create } from "zustand";

export type Toast = {
  id: number;
  title: string;
  text?: string;
  tone?: "default" | "warn" | "danger" | "success";
};

type ToastState = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    const ttl = t.tone === "warn" || t.tone === "danger" ? 8000 : 4000;
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), ttl);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
