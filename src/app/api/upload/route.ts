import { randomUUID } from "crypto";
import sharp from "sharp";
import { salvarImagem } from "@/lib/storage";

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) return Response.json({ erro: "Nenhum arquivo enviado." }, { status: 400 });
  if (!file.type.startsWith("image/")) return Response.json({ erro: "Envie uma imagem." }, { status: 415 });
  if (file.size > MAX_BYTES) return Response.json({ erro: "Imagem acima de 12 MB." }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();

  try {
    const base = sharp(buf).rotate();
    const [grande, thumb] = await Promise.all([
      base.clone().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
      base.clone().resize({ width: 640, height: 480, fit: "cover", position: "attention" }).webp({ quality: 78 }).toBuffer(),
    ]);
    const [salvo, salvoThumb] = await Promise.all([
      salvarImagem(`${id}.webp`, grande),
      salvarImagem(`${id}-thumb.webp`, thumb),
    ]);
    return Response.json({ url: salvo.url, thumbUrl: salvoThumb.url });
  } catch {
    return Response.json({ erro: "Não consegui processar essa imagem." }, { status: 422 });
  }
}
