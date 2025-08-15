export default function LoadingSalonProfile() {
  return (
    <div className="min-h-screen bg-noir-700 sm:px-8 lg:px-20 pt-24">
      <section className="relative z-10 px-4 py-10 md:-mt-10">
        {/* HERO mobile */}
        <div className="mx-auto sm:hidden mb-4">
          <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="relative h-[300px] bg-white/5 animate-pulse" />
          </div>
        </div>

        <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Aside (sticky) */}
          <aside className="space-y-4 md:order-2 md:sticky md:top-24 h-fit">
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur shadow-[0_6px_24px_rgba(0,0,0,0.25)]">
              <div className="h-3 w-28 bg-white/10 rounded mb-4 animate-pulse" />

              <ul className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-tertiary-400/60 mt-1" />
                    <div className="h-3 w-48 bg-white/10 rounded animate-pulse" />
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <div className="h-3 w-16 bg-white/10 rounded mb-3 animate-pulse" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-10 rounded-lg border border-white/10 bg-white/10 animate-pulse"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <div className="h-9 flex-1 rounded-xl bg-gradient-to-r from-tertiary-400/40 to-tertiary-500/40 animate-pulse" />
                <div className="h-9 flex-1 rounded-xl bg-white/10 border border-white/20 animate-pulse" />
              </div>
            </div>

            {/* Horaires */}
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <div className="h-3 w-20 bg-white/10 rounded mb-4 animate-pulse" />
              <ul className="space-y-1.5">
                {[...Array(7)].map((_, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm rounded-xl px-4 py-2"
                  >
                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Col principale */}
          <div className="md:col-span-2 space-y-6 md:order-1">
            {/* HERO desktop */}
            <div className="mx-auto hidden sm:block">
              <div className="relative overflow-hidden rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <div className="relative h-[300px] md:h-[420px] bg-white/5 animate-pulse" />
              </div>
            </div>

            {/* Présentation */}
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-16 bg-white/10 rounded animate-pulse"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-3 bg-white/10 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Tabs (Photos / Portfolio / Produits) */}
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
              <div className="h-8 w-56 bg-white/10 rounded mb-4 animate-pulse" />
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <li
                    key={i}
                    className="h-28 rounded-lg bg-white/10 animate-pulse"
                  />
                ))}
              </ul>
            </div>

            {/* Équipe */}
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/10 h-28 animate-pulse"
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
