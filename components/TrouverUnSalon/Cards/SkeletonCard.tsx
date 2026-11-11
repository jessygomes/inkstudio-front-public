export default function SkeletonCard() {
  return (
    <div aria-hidden="true" className="h-full rounded-3xl bg-noir-700 p-2 motion-safe:animate-pulse">
      <div className="aspect-4/3 rounded-2xl bg-white/5" />
      <div className="space-y-3 px-2 pb-1.5 pt-3.5">
        <div className="flex items-center gap-3"><div className="size-11 rounded-xl bg-white/8" /><div className="flex-1 space-y-2"><div className="h-4 w-2/3 rounded-lg bg-white/10" /><div className="h-3 w-1/2 rounded bg-white/5" /></div></div>
        <div className="flex gap-1.5"><div className="h-6 w-16 rounded-xl bg-white/5" /><div className="h-6 w-20 rounded-xl bg-white/5" /></div>
        <div className="h-10 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}
