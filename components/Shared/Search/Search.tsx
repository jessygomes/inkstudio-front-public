"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";

export const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1) initialise depuis l'URL pour ne pas effacer la query à l'arrivée
  const [query, setQuery] = useState<string>(searchParams.get("query") ?? "");

  // 2) si l’URL change (ex: filtres/pagination), on resynchronise l’input
  useEffect(() => {
    const urlQuery = searchParams.get("query") ?? "";
    setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const q = (query ?? "").trim();
      const currentUrlQuery = searchParams.get("query") ?? "";

      // 🔒 Ne touche pas à l’URL si rien ne change
      if (q === currentUrlQuery) return;

      let newUrl = "";
      if (q) {
        newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: q,
        });
      } else {
        // q vide -> ne supprime que si l’URL contient encore `query`
        if (!currentUrlQuery) return;
        newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ["query"],
        });
      }

      router.replace(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchParams, router]);

  return (
    <div className="">
      <input
        type="text"
        placeholder="Rechercher..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full text-sm text-white bg-white/10 placeholder:text-white/30 placeholder:text-xs py-1 px-4 font-var(--font-one) border-[1px] rounded-lg border-white/20 focus:outline-none focus:border-tertiary-400 transition-colors"
      />
    </div>
  );
};
