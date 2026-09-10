export default function LoadingSalonProfile() {
  return (
    <div role="status" aria-label="Chargement du profil salon" className="min-h-screen bg-noir-700 px-4 py-10 sm:px-6 lg:px-8 xl:px-16">
      <span className="sr-only">Chargement du profil salon…</span>
      <div aria-hidden="true" className="mx-auto max-w-7xl lg:max-w-none motion-safe:animate-pulse">
        <div className="mb-6 h-5 w-32 rounded bg-white/10" />
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-noir-500 lg:hidden">
          <div className="h-48 bg-white/5 sm:h-64 lg:h-80" />
          <div className="px-6 pb-8">
            <div className="relative -mt-12 mb-5 h-24 w-24 rounded-2xl border-4 border-noir-500 bg-white/10" />
            <div className="h-9 w-2/3 rounded bg-white/10" />
            <div className="mt-4 h-4 w-1/3 rounded bg-white/5" />
          </div>
        </div>
        <div className="my-6 h-12 rounded-xl bg-white/5 lg:hidden" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] xl:gap-8">
          <div className="space-y-6">
            <div className="hidden min-h-96 rounded-3xl border border-white/10 bg-noir-500 lg:block xl:min-h-[440px]" />
            <div className="hidden h-12 rounded-xl bg-white/5 lg:block" />
            <div className="h-56 rounded-2xl border border-white/10 bg-noir-500" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => <div key={i} className="aspect-4/3 rounded-xl bg-white/5" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-44 rounded-2xl border border-white/10 bg-noir-500" />
            <div className="h-64 rounded-2xl border border-white/10 bg-noir-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
