import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

/**
 * Camada fina de armazenamento de imagens. Hoje grava em `public/uploads`;
 * trocar por Vercel Blob (ou S3) é reimplementar só estas três funções.
 */
export type ArquivoSalvo = { url: string; chave: string };

const DIR = path.join(process.cwd(), "public", "uploads");
const PREFIXO = "/uploads/";

export async function salvarImagem(chave: string, conteudo: Buffer): Promise<ArquivoSalvo> {
  await mkdir(DIR, { recursive: true });
  await writeFile(path.join(DIR, chave), conteudo);
  return { url: `${PREFIXO}${chave}`, chave };
}

export async function removerImagem(url: string | null | undefined) {
  if (!url?.startsWith(PREFIXO)) return;
  await unlink(path.join(DIR, path.basename(url))).catch(() => {});
}

/** Remove a imagem e o thumbnail que a acompanha. */
export async function removerImagemEThumb(url: string | null | undefined) {
  if (!url?.startsWith(PREFIXO)) return;
  const base = path.basename(url);
  await Promise.all([removerImagem(url), removerImagem(`${PREFIXO}${base.replace(/\.webp$/, "-thumb.webp")}`)]);
}
