import { create } from "zustand";

type DayState = {
  kcal: number;
  aguaMl: number;
  metaCalorica: number;
  metaAguaMl: number;
  hidratar: (p: { kcal: number; aguaMl: number; metaCalorica: number; metaAguaMl: number }) => void;
  addKcal: (k: number) => void;
  addAgua: (ml: number) => void;
  setMetas: (m: { metaCalorica: number; metaAguaMl: number }) => void;
};

/** Estado leve do dia: espelha o servidor e permite atualização otimista nos registros rápidos. */
export const useDay = create<DayState>((set) => ({
  kcal: 0,
  aguaMl: 0,
  metaCalorica: 2000,
  metaAguaMl: 2000,
  hidratar: (p) => set(p),
  addKcal: (k) => set((s) => ({ kcal: Math.max(0, s.kcal + k) })),
  addAgua: (ml) => set((s) => ({ aguaMl: Math.max(0, s.aguaMl + ml) })),
  setMetas: (m) => set(m),
}));
