export type TattooStyleOption = { value: string; label: string };

export function tattooStyleKey(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("fr-FR").replace(/[\s\p{Pd}_]+/gu, "");
}

/** Keep account-defined values for the API while merging spelling variants in the UI. */
export function getTattooStyleOptions(values: unknown[], selected = ""): TattooStyleOption[] {
  const groups = new Map<string, TattooStyleOption>();
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) continue;
    const raw = value.trim();
    const key = tattooStyleKey(raw);
    if (!key) continue;
    if (!groups.has(key)) {
      groups.set(key, { value: raw, label: raw.replace(/[\p{Pd}_]+/gu, " ").replace(/\s+/gu, " ") });
    }
  }
  if (selected.trim()) {
    const key = tattooStyleKey(selected);
    const group = groups.get(key);
    // Preserve bookmarked filter values without adding another equivalent option.
    if (group) group.value = selected;
    else if (key) groups.set(key, { value: selected, label: selected.trim() });
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label, "fr", { sensitivity: "base" }));
}

export function parseSelectedTattooStyles(value: string): string[] {
  return getTattooStyleOptions(value.split(",")).map(option => option.value);
}
