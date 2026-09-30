import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  subDays,
  addDays,
  format,
  isToday,
  isSameDay,
  isFuture,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const inicioDoDia = (d: Date | number = new Date()) => startOfDay(d);
export const fimDoDia = (d: Date | number = new Date()) => endOfDay(d);
export const intervaloDoDia = (d: Date | number = new Date()) => ({ gte: startOfDay(d), lte: endOfDay(d) });

export const semanaDe = (d: Date | number = new Date()) => ({
  inicio: startOfWeek(d, { weekStartsOn: 0 }),
  fim: endOfWeek(d, { weekStartsOn: 0 }),
});

export const diasDoIntervalo = (inicio: Date, fim: Date) => eachDayOfInterval({ start: inicio, end: fim });

/** Últimos `n` dias terminando hoje, do mais antigo para o mais recente. */
export const ultimosDias = (n: number, ref: Date = new Date()) =>
  eachDayOfInterval({ start: subDays(startOfDay(ref), n - 1), end: startOfDay(ref) });

export { subDays, addDays, isToday, isSameDay, isFuture, parseISO };

/** Chave estável de dia (YYYY-MM-DD) para agrupar e para a URL. */
export const chaveDoDia = (d: Date | number) => format(d, "yyyy-MM-dd");

export const deChaveDoDia = (s: string) => startOfDay(parseISO(s));

const capitalizarInicial = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const fmtDiaCurto = (d: Date | number) => format(d, "d MMM", { locale: ptBR });
export const fmtDiaSemanaCurto = (d: Date | number) => format(d, "EEEEE", { locale: ptBR });
export const fmtDiaNumero = (d: Date | number) => format(d, "d", { locale: ptBR });
export const fmtMesAno = (d: Date | number) => capitalizarInicial(format(d, "MMMM 'de' yyyy", { locale: ptBR }));
export const fmtDiaCompleto = (d: Date | number) =>
  capitalizarInicial(format(d, "EEEE, d 'de' MMMM", { locale: ptBR }));
export const fmtHoraCurta = (d: Date | number) => format(d, "HH:mm");

/** Rótulo relativo amigável para cabeçalhos de dia. */
export function rotuloDoDia(d: Date) {
  if (isToday(d)) return "Hoje";
  if (isSameDay(d, subDays(new Date(), 1))) return "Ontem";
  return fmtDiaCompleto(d);
}

export function periodoDoDia(d: Date) {
  const h = d.getHours();
  if (h < 11) return "Café da manhã";
  if (h < 15) return "Almoço";
  if (h < 18) return "Lanche";
  return "Jantar";
}
