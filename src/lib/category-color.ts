// Paleta categórica: cada categoría/modelo se queda siempre con el mismo
// color (por hash del texto), para poder reconocerlas de un vistazo. Los 12
// tonos son los "system colors" de Apple (Red, Orange, Yellow, Green, Mint,
// Teal, Cyan, Blue, Indigo, Purple, Pink, Brown), llevados a la familia de
// Tailwind más cercana para mantener el contraste ya resuelto por sus
// escalas; Brown no existe en Tailwind, así que va en hex directo.
const CATEGORY_STYLES = [
  { bg: "bg-red-500/12", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  { bg: "bg-orange-500/12", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
  { bg: "bg-yellow-500/14", text: "text-yellow-800 dark:text-yellow-400", dot: "bg-yellow-500" },
  { bg: "bg-green-500/12", text: "text-green-700 dark:text-green-400", dot: "bg-green-500" },
  { bg: "bg-teal-400/14", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-400" },
  { bg: "bg-cyan-600/12", text: "text-cyan-700 dark:text-cyan-400", dot: "bg-cyan-600" },
  { bg: "bg-sky-500/12", text: "text-sky-700 dark:text-sky-400", dot: "bg-sky-500" },
  { bg: "bg-blue-500/12", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  { bg: "bg-indigo-500/12", text: "text-indigo-700 dark:text-indigo-400", dot: "bg-indigo-500" },
  { bg: "bg-violet-500/12", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500" },
  { bg: "bg-pink-500/12", text: "text-pink-700 dark:text-pink-400", dot: "bg-pink-500" },
  { bg: "bg-[#a2845e]/14", text: "text-[#7c6242] dark:text-[#c8a877]", dot: "bg-[#a2845e]" },
] as const;

export type CategoryStyle = (typeof CATEGORY_STYLES)[number];

export function getCategoryStyle(key: string): CategoryStyle {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_STYLES[hash % CATEGORY_STYLES.length];
}
