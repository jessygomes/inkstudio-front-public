export default function SkeletonCard() {
  return (
    <div className="relative flex flex-col rounded-3xl overflow-hidden border border-white/10 bg-[var(--color-noir-500)]/70">
      <div className="h-48 w-full bg-white/5" />
      <div className="p-5 sm:p-6 space-y-3">
        <div className="h-6 w-2/3 bg-white/10 rounded" />
        <div className="h-4 w-1/2 bg-white/10 rounded" />
        <div className="flex gap-3 pt-2">
          <div className="h-9 w-28 bg-white/10 rounded-xl" />
          <div className="h-9 w-24 bg-white/10 rounded-xl" />
        </div>
      </div>
      <div className="h-1 w-full bg-white/10" />
    </div>
  );
}
