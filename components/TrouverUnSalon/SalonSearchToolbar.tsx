"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MapPin, Palette, RotateCcw, Map, LandPlot, PenTool } from "lucide-react";
import { Search } from "@/components/Shared/Search/Search";
import AppButton from "@/components/Shared/AppButton";
import FilterSelect from "@/components/Shared/FilterSelect";
import { getTattooStyleOptions, parseSelectedTattooStyles, tattooStyleKey } from "@/lib/utils/tattooStyles";
import { formatCityLabel, parseSelectedCities } from "@/lib/utils/searchCities";
import { searchProfileTypes } from "@/lib/utils/searchProfileTypes";
import { parseGeographyCodes, regionOptions, departmentOptions } from "@/lib/utils/searchGeography";

const codeKey = (value: string) => value.trim().toUpperCase();
const cityKey = (value: string) => value.trim().toLocaleLowerCase("fr-FR");

export default function SalonSearchToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const profileType = params.get("profileType") || "";
  const city = params.get("city") || "";
  const style = params.get("style") || "";
  const region = params.get("region") || "";
  const department = params.get("department") || "";
  const selectedRegions = parseGeographyCodes(region);
  const selectedDepartments = parseGeographyCodes(department);
  const selectedCities = parseSelectedCities(city);
  const selectedStyles = parseSelectedTattooStyles(style);
  const [cities, setCities] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      const results = await Promise.allSettled(["cities", "styleTattoo"].map(async endpoint => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/users/${endpoint}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Filtres indisponibles");
        const data: unknown = await response.json();
        return Array.isArray(data) ? data.filter((value): value is string => typeof value === "string" && !!value.trim()) : [];
      }));
      if (controller.signal.aborted) return;
      if (results[0].status === "fulfilled") setCities(results[0].value);
      if (results[1].status === "fulfilled") setStyles(results[1].value);
    };
    void load();
    return () => controller.abort();
  }, []);
  const update = (key?: string, value?: string) => {
    const next = new URLSearchParams(params.toString());
    if (!key) ["query", "city", "style", "region", "department", "profileType", "page"].forEach(name => next.delete(name));
    else { if (value) next.set(key, value); else next.delete(key); next.set("page", "1"); }
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  };
  return <div className="grid grid-cols-2 items-center gap-2 lg:grid-cols-[minmax(180px,1.5fr)_repeat(5,minmax(0,1fr))_auto]">
    <div className="col-span-2 min-w-0 lg:col-span-1"><Search /></div>
    <FilterSelect label="Type de profil" placeholder="Tous les profils" unit="profil" icon={<PenTool size={14} />} selected={profileType ? [profileType] : []} options={[...searchProfileTypes]} multiple={false} onApply={values => update("profileType", values[0] || "")} align="left" />
    <FilterSelect label="Choisissez vos régions" placeholder="Toutes les régions" unit="région" icon={<Map size={14} />} selected={selectedRegions} options={regionOptions} normalize={codeKey} onApply={values => update("region", values.join(","))} align="left" />
    <FilterSelect label="Choisissez vos départements" placeholder="Tous les départements" unit="département" icon={<LandPlot size={14} />} selected={selectedDepartments} options={departmentOptions} normalize={codeKey} onApply={values => update("department", values.join(","))} align="left" />
    <FilterSelect label="Choisissez vos villes" placeholder="Toutes les villes" unit="ville" icon={<MapPin size={14} />} selected={selectedCities} options={parseSelectedCities([...cities, ...selectedCities].join(",")).map(value => ({ value, label: formatCityLabel(value) }))} normalize={cityKey} onApply={values => update("city", values.join(","))} align="left" />
    <FilterSelect label="Choisissez vos styles" placeholder="Tous les styles" unit="style" icon={<Palette size={14} />} selected={selectedStyles} options={getTattooStyleOptions([...styles, ...selectedStyles])} normalize={tattooStyleKey} onApply={values => update("style", values.join(","))} />
    <AppButton type="button" variant="secondary" onClick={() => update()} disabled={!city && !style && !region && !department && !profileType && !params.get("query")} className="col-span-2 h-11! px-3! py-2! text-xs! shadow-none! lg:col-span-1"><RotateCcw size={13} />Effacer</AppButton>
  </div>;
}
