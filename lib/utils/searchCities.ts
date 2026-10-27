export function parseSelectedCities(value: string): string[] {
  const cities = new Map<string, string>();
  for (const entry of value.split(",")) {
    const city = entry.trim();
    const key = city.toLocaleLowerCase("fr-FR");
    if (city && !cities.has(key)) cities.set(key, city);
  }
  return [...cities.values()].sort((a, b) => a.localeCompare(b, "fr"));
}
