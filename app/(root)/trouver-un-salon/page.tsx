import { Search } from "@/components/Shared/Search/Search";
import ListeSalon from "@/components/TrouverUnSalon/ListeSalon";
import { IoBusinessOutline } from "react-icons/io5";

export default function TrouverUnSalonPage() {
  return (
    <div className="min-h-screen">
      <section className="px-4 sm:px-8 lg:px-20 pt-23 bg-noir-700">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-noir-700/80 to-noir-500/80 p-4 rounded-xl shadow-xl border border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-tertiary-400/30 rounded-full flex items-center justify-center ">
              <IoBusinessOutline
                size={28}
                className="text-tertiary-400 animate-pulse"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-var(--font-one) tracking-wide uppercase mb-1">
                Trouver mon salon
              </h1>
              <p className="text-white/60 text-xs font-var(--font-one)">
                Trouvez facilement un salon de tatouage près de chez vous.
                Filtrez par ville, style ou artiste.
              </p>
            </div>
          </div>
        </div>
        <Search />

        <div className="py-6">
          <ListeSalon />
        </div>
      </section>
    </div>
  );
}
