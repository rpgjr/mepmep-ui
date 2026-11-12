/** The colour schemes a viewer can pick. "pop" is the default and has no data-theme attribute. */
export const THEMES = [
  { value: "pop", label: "Pop" },
  { value: "ember", label: "Ember" },
  { value: "ocean", label: "Ocean" },
  { value: "jungle", label: "Jungle" },
  { value: "grape", label: "Grape" },
  { value: "gold", label: "Gold" },
] as const;

const KEY = "mepmep.theme";

export const currentTheme = () => document.documentElement.dataset.theme ?? "pop";

/** Applies a scheme to the page and remembers it in this browser only. */
export function applyTheme(value: string) {
  if (value === "pop") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = value;
  try { localStorage.setItem(KEY, value); } catch { /* storage blocked */ }
}
