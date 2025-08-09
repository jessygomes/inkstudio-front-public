"use client";

import { SalonProps } from "@/lib/type";
import { useEffect, useState } from "react";
import SkeletonCard from "./Cards/SkeletonCard";
import { SalonCard } from "./Cards/SalonCard";

export default function ListeSalon() {
  //! STATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salons, setSalons] = useState<SalonProps[]>([]);

  //! RECUPERER LES SALONS
  const fetchSalons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACK_URL}/users`,
        { method: "GET" }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSalons(data);
    } catch (err) {
      console.error("Error fetching salons:", err);
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //! RENDU
  return (
    <section>
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
            <p className="text-white font-one text-xl text-center">{error}</p>
            <button
              onClick={() => fetchSalons()}
              className="cursor-pointer mt-2 px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-lg font-medium font-one text-xs shadow-lg transition-all"
            >
              Réessayer
            </button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {salons.map((salon) => (
            <li key={salon.id}>
              <SalonCard salon={salon} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
