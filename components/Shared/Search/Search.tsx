"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon, X } from "lucide-react";

export const Search = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("query") ?? "";
  const [search, setSearch] = useState({ source: urlQuery, value: urlQuery });
  if (search.source !== urlQuery) setSearch({ source: urlQuery, value: urlQuery });
  const query = search.source === urlQuery ? search.value : urlQuery;
  const setQuery = (value: string) => setSearch({ source: urlQuery, value });
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = query.trim();
      if (next === (searchParams.get("query") ?? "")) return;
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("query", next); else params.delete("query");
      params.set("page", "1");
      router.replace(`${pathname}?${params}`, { scroll: false });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query, searchParams, router, pathname]);
  return <div role="search" className="relative"><label htmlFor="salon-search" className="sr-only">Rechercher un salon ou un artiste</label><SearchIcon size={17} className="pointer-events-none absolute left-3.5 top-3 text-tertiary-400/75" aria-hidden="true" /><input id="salon-search" type="search" autoComplete="off" placeholder="Un salon, un artiste, une ville, un style…" value={query} onChange={event => setQuery(event.target.value)} className="h-11 w-full min-w-0 rounded-xl border border-white/10 bg-noir-800 pl-10 pr-11 font-one text-sm text-white outline-none transition placeholder:text-white/30 focus:border-tertiary-400/50 focus:ring-2 focus:ring-tertiary-400/10 [&::-webkit-search-cancel-button]:appearance-none" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche" className="absolute right-1.5 top-1.5 grid size-8 place-items-center rounded-lg text-white/35 transition hover:bg-white/5 hover:text-white"><X size={14} /></button>}</div>;
};
