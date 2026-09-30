export const fmtNum = (n: number, digits = 0) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const fmtKcal = (n: number) => `${fmtNum(Math.round(n))} kcal`;

export const fmtQtd = (n: number, unidade: string) =>
  `${fmtNum(n, unidade === "un" ? 2 : 0)} ${unidade}`;

export const fmtHora = (d: Date) =>
  d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const fmtDataLonga = (d = new Date()) =>
  capitalizar(
    new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(d),
  );

export function saudacao(d = new Date()) {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export const plural = (n: number, um: string, varios: string) => (n === 1 ? um : varios);

/** minúsculas + sem acentos, para busca tolerante */
export const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** aceita vírgula como separador decimal */
export const parseNum = (s: string | number) =>
  typeof s === "number" ? s : parseFloat(String(s).replace(",", ".")) || 0;
