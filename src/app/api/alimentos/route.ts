/**
 * Busca dados nutricionais no Open Food Facts para preencher o cadastro de
 * ingrediente. Opcional: se a API não responder, o formulário segue manual.
 *
 * Texto livre vai pelo search-a-licious (o antigo /cgi/search.pl responde 503);
 * código de barras vai pela API v2 de produto.
 */
export const revalidate = 3600;

type Sugestao = {
  nome: string;
  marca: string | null;
  caloriasPor100g: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
  codigo: string | null;
};

type ProdutoOFF = {
  code?: string;
  product_name?: string;
  product_name_pt?: string;
  brands?: string | string[]; // v2 devolve string; search-a-licious devolve array
  nutriments?: Record<string, unknown>;
};

const CAMPOS = "code,product_name,product_name_pt,brands,nutriments";
const CABECALHOS = { "User-Agent": "cozinha-app/1.0 (app pessoal de receitas)", Accept: "application/json" };

function primeiraMarca(b: string | string[] | undefined) {
  const bruto = Array.isArray(b) ? b[0] : b?.split(",")[0];
  return bruto?.trim() || null;
}

const num = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 10) / 10 : 0;
};

function converter(p: ProdutoOFF): Sugestao | null {
  const nome = (p.product_name_pt || p.product_name || "").trim();
  const n = p.nutriments ?? {};
  const kcal = num(n["energy-kcal_100g"]) || Math.round(num(n["energy_100g"]) / 4.184);
  if (!nome || kcal <= 0) return null;
  return {
    nome,
    marca: primeiraMarca(p.brands),
    caloriasPor100g: kcal,
    proteina: num(n["proteins_100g"]),
    carboidrato: num(n["carbohydrates_100g"]),
    gordura: num(n["fat_100g"]),
    codigo: p.code ?? null,
  };
}

async function buscar(url: string) {
  const res = await fetch(url, { headers: CABECALHOS, signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as { product?: ProdutoOFF; products?: ProdutoOFF[]; hits?: ProdutoOFF[] };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const termo = (searchParams.get("q") ?? "").trim();
  const codigo = (searchParams.get("codigo") ?? "").trim();

  if (!termo && !codigo) return Response.json({ resultados: [] });

  const url = codigo
    ? `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(codigo)}.json?fields=${CAMPOS}`
    : `https://search.openfoodfacts.org/search?q=${encodeURIComponent(termo)}&page_size=8&fields=${CAMPOS}`;

  try {
    const json = await buscar(url);
    const brutos = codigo ? (json.product ? [json.product] : []) : (json.hits ?? json.products ?? []);
    const resultados = brutos
      .map(converter)
      .filter((x): x is Sugestao => x !== null)
      .slice(0, 6);
    return Response.json({ resultados });
  } catch {
    return Response.json({ resultados: [], erro: "A busca de alimentos não respondeu. Preencha os valores à mão." });
  }
}
