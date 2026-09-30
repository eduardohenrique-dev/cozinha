// Confere se as fontes do app estão em src/app/fonts/ antes de rodar o dev ou o build.
// As fontes não vêm no repositório (cada uma tem a sua licença): veja docs/instalacao.md.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const pasta = join(fileURLToPath(new URL("..", import.meta.url)), "src", "app", "fonts");
const arquivos = [
  ["Fraunces-Variable.ttf", "Fraunces, normal (Google Fonts: fonts.google.com/specimen/Fraunces)"],
  ["Fraunces-VariableItalic.ttf", "Fraunces, itálico (mesmo pacote)"],
  ["GeneralSans-Variable.woff2", "General Sans, normal (Fontshare: fontshare.com/fonts/general-sans)"],
  ["GeneralSans-VariableItalic.woff2", "General Sans, itálico (mesmo pacote)"],
];

const faltando = arquivos.filter(([nome]) => !existsSync(join(pasta, nome)));
if (faltando.length === 0) process.exit(0);

console.error("\nFaltam fontes em src/app/fonts/:\n");
for (const [nome, origem] of faltando) console.error(`  - ${nome}\n      ${origem}`);
console.error("\nO passo a passo está em docs/instalacao.md.\n");
process.exit(1);
