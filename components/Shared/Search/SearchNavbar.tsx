/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Salon = {
  id: string;
  name: string;
  city?: string | null;
  postalCode?: string | null;
  slug?: string | null;
  coverUrl?: string | null;
};

type SearchNavbarProps = {
  className?: string;
  limit?: number; // nb de suggestions
};

export default function SearchNavbar({
  className,
  limit = 5,
}: SearchNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Salon[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- helpers ----
  const toSlug = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const computeSalonHref = (s: Salon) => {
    const slug =
      s.slug && s.slug.trim() !== "" ? s.slug : toSlug(s.name || "salon");
    const locSource = [s.city, s.postalCode]
      .filter((v) => !!v && String(v).trim() !== "")
      .join("-");
    const loc = locSource ? toSlug(locSource) : "localisation";
    return `/salon/${slug}/${loc}`;
  };

  const navigateToSalon = (s: Salon) => {
    try {
      const href = computeSalonHref(s);
      router.push(href);
    } finally {
      setOpen(false);
      setHighlightIndex(-1);
    }
  };

  const navigateToListing = (q: string) => {
    const url = `/trouver-un-salon?query=${encodeURIComponent(q.trim())}`;
    router.push(url);
    setOpen(false);
    setHighlightIndex(-1);
  };

  const onSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    navigateToListing(query);
  };

  // Fermer le dropdown quand on change de page
  useEffect(() => {
    setOpen(false);
    setHighlightIndex(-1);
  }, [pathname]);

  // Fermer si clic à l’extérieur
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Debounced fetch suggestions
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const base = process.env.NEXT_PUBLIC_BACK_URL!;
        const url = `${base}/users?query=${encodeURIComponent(
          q
        )}&page=1&limit=${limit}`;

        const res = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const salons: Salon[] = Array.isArray(data?.users)
          ? data.users.map((u: any) => ({
              id: u.id,
              name:
                u.salonName ??
                (`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "Salon"),
              city: u.city ?? null,
              postalCode: u.postalCode ?? null,
              slug: u.slug ?? null,
              coverUrl:
                u.image ??
                (Array.isArray(u.salonPhotos) ? u.salonPhotos[0] : null) ??
                null,
            }))
          : [];

        setResults(salons);
        setOpen(true);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setResults([]);
          setOpen(true); // on ouvre quand même pour afficher "aucun résultat"
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query, limit]);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open) {
      if (e.key === "Enter") onSubmit();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && results[highlightIndex]) {
        navigateToSalon(results[highlightIndex]); // 👉 va direct sur la page profil
      } else {
        onSubmit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
      inputRef.current?.blur();
    }
  };

  const hasResults = results.length > 0;

  return (
    <div className={className}>
      <div ref={wrapperRef} className="relative w-[240px]">
        <form onSubmit={onSubmit}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher un salon…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setOpen(true)}
              onKeyDown={onKeyDown}
              className="w-full text-xs md:text-sm text-white bg-white/10 placeholder:text-white/30 py-2 pl-3 pr-8 font-one border rounded-lg border-white/20 focus:outline-none focus:border-tertiary-400 transition-colors"
            />
            {loading && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tertiary-400" />
              </div>
            )}
          </div>
        </form>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/10 bg-noir-600/90 backdrop-blur shadow-xl">
            <div className="max-h-80 overflow-auto py-1">
              {loading ? (
                <div className="px-3 py-2 text-xs text-white/60">
                  Recherche…
                </div>
              ) : hasResults ? (
                results.map((s, idx) => {
                  const active = idx === highlightIndex;
                  return (
                    <button
                      key={s.id ?? `${s.name}-${idx}`}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      onMouseLeave={() => setHighlightIndex(-1)}
                      onClick={() => navigateToSalon(s)} // 👉 direct profil
                      className={`cursor-pointer w-full text-left px-3 py-2 flex items-center gap-2 ${
                        active ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center text-[10px] text-white/70">
                        {s.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.coverUrl}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (s.name ?? "?").slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs md:text-sm text-white truncate font-one">
                          {s.name}
                        </div>
                        <div className="text-[10px] md:text-xs text-white/50 truncate">
                          {[s.city, s.postalCode].filter(Boolean).join(" ") ||
                            "—"}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-xs text-white/60">
                  Aucun salon trouvé
                </div>
              )}
            </div>

            {/* Footer du dropdown */}
            <div className="border-t border-white/10 p-1">
              <button
                onClick={() => navigateToListing(query || "")}
                className="cursor-pointer w-full text-[11px] md:text-xs text-white/80 hover:text-white px-2 py-1 rounded-md hover:bg-white/5"
              >
                Voir tous les résultats pour “{(query || "").trim()}”
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
