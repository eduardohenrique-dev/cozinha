/** Thumbnail gerado pelo upload segue a convenção `<id>-thumb.webp`; outras URLs (seed) voltam iguais. */
export function thumbDe(url: string | null | undefined) {
  if (!url) return null;
  return url.startsWith("/uploads/") && url.endsWith(".webp") ? url.replace(/\.webp$/, "-thumb.webp") : url;
}
