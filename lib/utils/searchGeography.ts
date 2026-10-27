import { franceGeography } from "@/lib/data/franceGeography";

export function parseGeographyCodes(value: string): string[] {
  return [...new Set(value.split(",").map(code => code.trim().toUpperCase()).filter(Boolean))].sort();
}

export const regionOptions = franceGeography.regions.map(region => ({ value: region.code, label: region.name }));
export const departmentOptions = franceGeography.departments.map(department => ({ value: department.code, label: `${department.code} · ${department.name}` }));

export function geographyLabel(type: "region" | "department", code: string): string {
  const options = type === "region" ? regionOptions : departmentOptions;
  return options.find(option => option.value === code)?.label || code;
}
