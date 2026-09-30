import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, format, parseISO } from "date-fns";

export { chaveDoDia, deChaveDoDia, diasDoIntervalo, fmtDiaCompleto, isFuture, rotuloDoDia } from "@/lib/date";

export const chaveDoMes = (d: Date) => format(d, "yyyy-MM");
export const mesDaChave = (s: string) => startOfMonth(parseISO(`${s}-01`));

/** Grade do calendário: semanas completas cobrindo o mês. */
export const startOfCalendario = (mes: Date) => startOfWeek(startOfMonth(mes), { weekStartsOn: 0 });
export const fimDoCalendario = (mes: Date) => endOfWeek(endOfMonth(mes), { weekStartsOn: 0 });

export const mesAnteriorDe = (chave: string) => chaveDoMes(subMonths(mesDaChave(chave), 1));

/** Null quando o mês seguinte ainda não começou: não há histórico no futuro. */
export function mesSeguinteDe(chave: string, hoje = new Date()): string | null {
  const proximo = addMonths(mesDaChave(chave), 1);
  return proximo > startOfMonth(hoje) ? null : chaveDoMes(proximo);
}
