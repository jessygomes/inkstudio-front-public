"use client";

import { SalonProps, UsersResponse } from "@/lib/type";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SkeletonCard from "./Cards/SkeletonCard";
import { SalonCard } from "./Cards/SalonCard";

export default function ListeSalon() {
  //! STATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salons, setSalons] = useState<SalonProps[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [pagination, setPagination] = useState<
    UsersResponse["pagination"] | null
  >(null);

  const queryValue = searchParams.get("query") ?? "";
  const limitFromUrl = Number(searchParams.get("limit")) || 12;
  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const updateURL = (params: URLSearchParams) => {
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  //! FETCH
  const fetchSalons = async (
    params: {
      query?: string;
      city?: string;
      style?: string;
      page?: number;
      limit?: number;
    } = {}
  ) => {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_BACK_URL!;
      const url = new URL(`${base}/users`);
      if (params.query) url.searchParams.set("query", params.query);
      if (params.city) url.searchParams.set("city", params.city);
      if (params.style) url.searchParams.set("style", params.style);
      url.searchParams.set("page", String(params.page ?? 1));
      url.searchParams.set("limit", String(params.limit ?? 12));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: UsersResponse = await res.json();

      setSalons(data.users);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Fetch des villes
  const fetchCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = process.env.NEXT_PUBLIC_BACK_URL!;
      const url = new URL(`${base}/users/cities`);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCities(data);
    } catch (e) {
      console.error(e);
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Fetch des styles
  const fetchStyles = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_BACK_URL!;
      const url = new URL(`${base}/users/styleTattoo`);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStyles(data as string[]);
    } catch (e) {
      console.error(e);
    }
  };

  //! SYNCHRO URL -> STATE + FETCH
  useEffect(() => {
    const query = searchParams.get("query") || undefined;
    const city = searchParams.get("city") || undefined;
    const style = searchParams.get("style") || undefined;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;

    fetchCities();
    fetchStyles();
    setSelectedCity(city ?? "");
    setSelectedStyle(style ?? "");
    fetchSalons({ query, city, style, page, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  //! UPDATE PARAM (centralise / remet page=1 quand filtre)
  const updateParam = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "") params.set(key, value);
    else params.delete(key);

    if (key === "city" || key === "query" || key === "style") {
      params.set("page", "1"); // reset page si filtre modifié
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    updateParam("city", value || undefined);
  };

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
    updateParam("style", value || undefined);
  };

  const goToPage = (p: number) => updateParam("page", String(p));

  //! CLEAR FILTERS
  const clearFilter = (key: "query" | "city" | "style") => {
    if (key === "city") setSelectedCity("");
    if (key === "style") setSelectedStyle("");
    updateParam(key, undefined); // supprime + remet page=1
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("query");
    params.delete("city");
    params.delete("style");
    params.set("page", "1"); // reset page
    setSelectedCity("");
    setSelectedStyle("");
    updateURL(params);
  };

  //! RENDU
  return (
    <section className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-8 flex-col sm:flex-row">
          {/* Ville */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label
              className="text-xs text-white/80 font-var(--font-one)"
              htmlFor="city-select"
            >
              Filtrer par ville
            </label>
            <select
              id="city-select"
              className="w-full sm:w-64 text-xs font-var(--font-one) rounded-lg border border-white/10 bg-black/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tertiary-500 transition"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              <option value="" className="bg-noir-500">
                Toutes les villes
              </option>
              {cities.map((c) => (
                <option key={c} value={c} className="bg-noir-500">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Style */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label
              className="text-xs text-white/80 font-var(--font-one)"
              htmlFor="style-select"
            >
              Filtrer par style
            </label>
            <select
              id="style-select"
              className="w-full sm:w-64 text-xs font-var(--font-one) rounded-lg border border-white/10 bg-black/20 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tertiary-500 transition"
              value={selectedStyle}
              onChange={(e) => handleStyleChange(e.target.value)}
            >
              <option value="" className="bg-noir-500">
                Tous les styles
              </option>
              {styles.map((s) => (
                <option key={s} value={s} className="bg-noir-500">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtres actifs */}
        {(selectedCity || selectedStyle) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-var(--font-one) text-white/50">
              Filtres actifs :
            </span>

            {selectedCity && (
              <span className="inline-flex items-center gap-2 px-2 py-1 bg-cyan-400/20 text-cyan-300 rounded-full text-xs font-var(--font-one) border border-cyan-400/30">
                ville: {selectedCity}
                <button
                  onClick={() => clearFilter("city")}
                  className="cursor-pointer hover:text-white/90"
                  aria-label="Supprimer filtre ville"
                >
                  ✕
                </button>
              </span>
            )}

            {selectedStyle && (
              <span className="inline-flex items-center gap-2 px-2 py-1 bg-violet-400/20 text-violet-300 rounded-full text-xs font-var(--font-one) border border-violet-400/30">
                style: {selectedStyle}
                <button
                  onClick={() => clearFilter("style")}
                  className="cursor-pointer hover:text-white/90"
                  aria-label="Supprimer filtre style"
                >
                  ✕
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="cursor-pointer px-2 py-1 bg-red-400/20 text-red-300 rounded-full font-var(--font-one) text-xs border border-red-400/30 hover:bg-red-400/30 transition-colors"
            >
              ✕ Effacer tout
            </button>
          </div>
        )}
      </div>

      {/* Ligne d’info “Affichage de X à Y…” */}
      <div className="text-white/60 text-xs font-var(--font-one)">
        Affichage de {pagination?.startIndex ?? 0} à {pagination?.endIndex ?? 0}{" "}
        sur {pagination?.totalUsers ?? 0} salon
        {(pagination?.totalUsers ?? 0) > 1 ? "s" : ""}
        {(queryValue || selectedCity || selectedStyle) && (
          <span className="ml-1">
            (
            {[
              queryValue ? `recherche: "${queryValue}"` : null,
              selectedCity ? `ville: ${selectedCity}` : null,
              selectedStyle ? `style: ${selectedStyle}` : null,
            ]
              .filter(Boolean)
              .join(", ")}
            )
          </span>
        )}
      </div>

      {/* Contenu */}
      {loading ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="animate-pulse">
              <SkeletonCard />
            </li>
          ))}
        </ul>
      ) : error ? (
        <div className="h-full w-full flex">
          <div className="mt-4 w-full rounded-2xl shadow-xl border border-white/10 p-10 flex flex-col items-center justify-center gap-6 mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-tertiary-400/30 to-tertiary-500/20 rounded-full flex items-center justify-center mb-2">
              <svg
                className="w-10 h-10 text-tertiary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M16 3H8a2 2 0 00-2 2v0a2 2 0 002 2h8a2 2 0 002-2v0a2 2 0 00-2-2zM8 21h8"
                />
              </svg>
            </div>
            <p className="text-white font-var(--font-one) text-xl text-center">
              {error}
            </p>
            <button
              onClick={() =>
                fetchSalons({
                  query: queryValue,
                  city: selectedCity,
                  style: selectedStyle,
                  page: pageFromUrl,
                  limit: limitFromUrl,
                })
              }
              className="cursor-pointer mt-2 px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-medium font-var(--font-one) text-xs shadow-lg transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : salons.length === 0 ? (
        <p className="text-white/70 text-sm">
          Aucun salon trouvé avec ces filtres.
        </p>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {salons.map((salon) => (
              <li key={salon.id}>
                <SalonCard salon={salon} />
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-2">
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors text-xs"
              >
                Précédent
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(pagination.totalPages, 5) },
                  (_, i) => {
                    const total = pagination.totalPages;
                    const curr = pagination.currentPage;
                    let pageNumber: number;

                    if (total <= 5) pageNumber = i + 1;
                    else if (curr <= 3) pageNumber = i + 1;
                    else if (curr >= total - 2) pageNumber = total - 4 + i;
                    else pageNumber = curr - 2 + i;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`cursor-pointer w-8 h-8 rounded-lg text-xs font-var(--font-one) transition-all ${
                          curr === pageNumber
                            ? "bg-gradient-to-r from-tertiary-400 to-tertiary-500 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="cursor-pointer px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-white/20 transition-colors text-xs"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
