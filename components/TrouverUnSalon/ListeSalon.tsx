"use client";
import { SalonProps, UsersResponse } from "@/lib/type";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal, X } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import SkeletonCard from "./Cards/SkeletonCard";
import { SalonCard } from "./Cards/SalonCard";
import { parseSelectedTattooStyles } from "@/lib/utils/tattooStyles";
import { parseSelectedCities } from "@/lib/utils/searchCities";
import { searchProfileTypes } from "@/lib/utils/searchProfileTypes";
import { parseGeographyCodes, geographyLabel } from "@/lib/utils/searchGeography";

export default function ListeSalon() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get("query") || "";
  const city = searchParams.get("city") || "";
  const style = searchParams.get("style") || "";
  const region = searchParams.get("region") || "";
  const department = searchParams.get("department") || "";
  const profileType = searchParams.get("profileType") || "";
  const requestedPage = Number(searchParams.get("page"));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salons, setSalons] = useState<SalonProps[]>([]);
  const [pagination, setPagination] = useState<UsersResponse["pagination"] | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const url = new URL(`${process.env.NEXT_PUBLIC_BACK_URL}/users`);
        if (query) url.searchParams.set("query", query);
        if (city) url.searchParams.set("city", city);
        if (style) url.searchParams.set("style", style);
        if (region) url.searchParams.set("region", region);
        if (department) url.searchParams.set("department", department);
        if (profileType) url.searchParams.set("profileType", profileType);
        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", String(limit));
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Recherche indisponible");
        const data: UsersResponse = await response.json();
        if (controller.signal.aborted) return;
        if (data.error) throw new Error("Recherche indisponible");
        setSalons(data.users || []);
        setPagination(data.pagination);
      } catch {
        if (!controller.signal.aborted) setError("Impossible de charger les profils pour le moment. Votre recherche est conservée.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [query, city, style, region, department, profileType, page, limit, retry]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    if (key !== "page") params.set("page", "1");
    router.replace(`${pathname}?${params}`, { scroll: false });
  };
  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["query", "city", "style", "region", "department", "profileType", "page"].forEach(key => params.delete(key));
    router.replace(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };
  const removeFilter = (key: string, value: string) => {
    if (key === "query" || key === "profileType") { updateParam(key, ""); return; }
    const parse = key === "city" ? parseSelectedCities : key === "style" ? parseSelectedTattooStyles : parseGeographyCodes;
    updateParam(key, parse(searchParams.get(key) || "").filter(entry => entry !== value).join(","));
  };
  const activeFilters = [
    { key: "query", label: query, value: query },
    { key: "profileType", label: searchProfileTypes.find(type => type.value === profileType)?.label || profileType, value: profileType },
    ...parseSelectedCities(city).map(value => ({ key: "city", label: value, value })),
    ...parseSelectedTattooStyles(style).map(value => ({ key: "style", label: value, value })),
    ...parseGeographyCodes(region).map(value => ({ key: "region", label: geographyLabel("region", value), value })),
    ...parseGeographyCodes(department).map(value => ({ key: "department", label: geographyLabel("department", value), value })),
  ].filter(filter => filter.value);

  const gridClass = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4";
  const pageCount = pagination?.totalPages || 0;
  const currentPage = pagination?.currentPage || page;
  const firstPage = Math.max(1, Math.min(currentPage - 2, pageCount - 4));

  return (
    <section aria-labelledby="salon-results-heading" className="space-y-4 font-one">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="salon-results-heading" className="text-lg font-medium text-white/90">Les profils à découvrir</h2><p role="status" className="mt-1 text-[11px] text-white/40">{loading ? "Recherche des salons et artistes…" : error ? "La recherche est momentanément indisponible." : `${pagination?.totalUsers ?? salons.length} profil${(pagination?.totalUsers ?? salons.length) > 1 ? "s" : ""} trouvé${(pagination?.totalUsers ?? salons.length) > 1 ? "s" : ""}${query ? ` pour « ${query} »` : ""}`}</p></div><span className="inline-flex items-center gap-1.5 text-[10px] text-white/35"><SlidersHorizontal size={12} />Affinez votre recherche</span></div>

      {!!activeFilters.length && <div className="flex flex-wrap gap-1.5">{activeFilters.map(filter => <button key={filter.key + ":" + filter.label} type="button" aria-label={`Retirer le filtre ${filter.label}`} onClick={() => removeFilter(filter.key, filter.value)} className="inline-flex max-w-full items-center gap-2 rounded-lg border border-tertiary-400/15 bg-tertiary-400/5 px-2.5 py-1.5 text-[10px] text-tertiary-400/85 transition hover:bg-tertiary-400/10"><span className="break-words">{filter.label}</span><X size={11} className="shrink-0" /></button>)}</div>}
      <div aria-busy={loading}>
        {loading ? <ul className={gridClass}>{Array.from({ length: 8 }, (_, index) => <li key={index}><SkeletonCard /></li>)}</ul> : error ? <div role="alert" className="rounded-2xl border border-white/10 bg-white/[0.015] p-8 text-center"><SearchX size={26} className="mx-auto mb-3 text-white/25" /><p className="mx-auto max-w-md text-sm leading-6 text-white/60">{error}</p><AppButton type="button" variant="secondary" onClick={() => setRetry(value => value + 1)} className="mt-4 px-4! text-xs! shadow-none!">Réessayer</AppButton></div> : !salons.length ? <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center"><SearchX size={28} className="mx-auto mb-3 text-white/25" /><h3 className="text-base text-white/85">Pas encore de profil pour cette recherche</h3><p className="mt-2 text-xs leading-6 text-white/45">Essayez un autre nom, une autre ville ou un style plus large.</p><AppButton type="button" variant="secondary" onClick={clearAll} className="mt-4 px-4! text-xs! shadow-none!">Effacer les filtres</AppButton></div> : <ul className={gridClass}>{salons.map(salon => <li key={salon.id} className="min-w-0"><SalonCard salon={salon} returnTo={`${pathname}?${searchParams.toString()}`} /></li>)}</ul>}
      </div>
      {!loading && !error && pageCount > 1 && <nav aria-label="Pages des résultats" className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4"><p className="text-[10px] text-white/40">{pagination?.startIndex}–{pagination?.endIndex} sur {pagination?.totalUsers} profils</p><div className="flex items-center gap-1.5"><AppButton type="button" variant="secondary" disabled={!pagination?.hasPreviousPage} onClick={() => updateParam("page", String(currentPage - 1))} aria-label="Page précédente" className="size-9! px-0! py-0! rounded-lg! shadow-none!"><ChevronLeft size={14} /></AppButton>{Array.from({ length: Math.min(5, pageCount) }, (_, index) => firstPage + index).map(number => <button key={number} type="button" aria-current={number === currentPage ? "page" : undefined} aria-label={`Page ${number}`} onClick={() => updateParam("page", String(number))} className={`grid size-9 place-items-center rounded-lg text-[11px] transition ${number === currentPage ? "bg-linear-to-r from-tertiary-400 to-tertiary-500 text-white" : "border border-white/8 text-white/45 hover:bg-white/5"}`}>{number}</button>)}<AppButton type="button" variant="secondary" disabled={!pagination?.hasNextPage} onClick={() => updateParam("page", String(currentPage + 1))} aria-label="Page suivante" className="size-9! px-0! py-0! rounded-lg! shadow-none!"><ChevronRight size={14} /></AppButton></div></nav>}
    </section>
  );
}
