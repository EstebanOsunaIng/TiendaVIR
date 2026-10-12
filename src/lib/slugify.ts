/**
 * Convierte texto libre en un slug URL-safe: minúsculas, sin acentos,
 * espacios y caracteres no alfanuméricos colapsados a guiones simples.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
