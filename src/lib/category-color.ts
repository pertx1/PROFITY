// Paleta categórica: cada categoría/modelo se queda siempre con el mismo
// color (por hash del texto), para poder reconocerlas de un vistazo.
const CATEGORY_STYLES = [
  { bg: "bg-blue-500/12", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  { bg: "bg-orange-500/12", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  { bg: "bg-emerald-500/12", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  { bg: "bg-amber-500/12", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  { bg: "bg-pink-500/12", text: "text-pink-700 dark:text-pink-400", dot: "bg-pink-500" },
  { bg: "bg-teal-500/12", text: "text-teal-700 dark:text-teal-400", dot: "bg-teal-500" },
  { bg: "bg-violet-500/12", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500" },
  { bg: "bg-red-500/12", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
] as const;

export type CategoryStyle = (typeof CATEGORY_STYLES)[number];

export function getCategoryStyle(key: string): CategoryStyle {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_STYLES[hash % CATEGORY_STYLES.length];
}
