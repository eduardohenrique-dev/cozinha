/** @type {import('next').NextConfig} */

// O build de producao usa uma pasta propria para nao sobrescrever o cache do
// `next dev`. Sem isso, rodar `npm run build` com o servidor de dev no ar
// deixa o app sem CSS (os manifests apontam para arquivos que nao existem).
const nextConfig = {
  distDir: process.env.NODE_ENV === "production" ? ".next-prod" : ".next",
};

export default nextConfig;
