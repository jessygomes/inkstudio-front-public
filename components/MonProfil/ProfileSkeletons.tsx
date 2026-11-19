import type { ReactNode } from "react";

/** Squelettes de chargement des onglets de « Mon compte » (sans contour, sur le fond de l'app). */

function Bone({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-white/6 ${className}`} />;
}

function Region({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-label={label} className={className}>
      <span className="sr-only">{label}…</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">{children}</div>
    </div>
  );
}

/** Onglet Rendez-vous : titre de section, mois, tuiles de rendez-vous. */
export function RdvSkeleton() {
  return (
    <Region label="Chargement des rendez-vous">
      <Bone className="mb-4 h-6 w-32 bg-white/10" />
      <Bone className="mb-3 h-3 w-24" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-4 rounded-2xl bg-noir-700 p-4">
            <div className="flex items-center gap-3">
              <Bone className="size-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Bone className="h-4 w-3/4 bg-white/10" />
                <Bone className="h-3 w-1/2" />
              </div>
              <Bone className="h-6 w-16 shrink-0 rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
              <Bone className="size-6 shrink-0" />
              <Bone className="h-3 w-2/5" />
            </div>
            <div className="flex gap-2">
              <Bone className="h-9 flex-1 rounded-xl" />
              <Bone className="h-9 w-9 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </Region>
  );
}

/** Onglet Moodboard : barre d'actions puis grille de moodboards. */
export function MoodboardSkeleton() {
  return (
    <Region label="Chargement des moodboards" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Bone className="h-4 w-56 max-w-[60%]" />
        <Bone className="h-11 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl bg-noir-700">
            <div className="grid aspect-4/3 grid-cols-2 gap-0.5">
              {[0, 1, 2, 3].map((cell) => <div key={cell} className="bg-white/5" />)}
            </div>
            <div className="space-y-2 p-4">
              <Bone className="h-4 w-2/3 bg-white/10" />
              <Bone className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </Region>
  );
}

/** Onglet Favoris : sélecteur de type puis grille de cartes. */
export function FavorisSkeleton() {
  return (
    <Region label="Chargement des favoris" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-xl bg-noir-700 p-1">
          <Bone className="h-11 w-40 rounded-xl bg-white/10" />
          <Bone className="h-11 w-32 rounded-xl" />
        </div>
        <Bone className="h-11 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-2xl bg-noir-700 p-3">
            <Bone className="size-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className="h-4 w-1/2 bg-white/10" />
              <Bone className="h-3 w-2/3" />
              <Bone className="h-3 w-1/3" />
            </div>
            <Bone className="size-10 shrink-0 rounded-xl" />
          </div>
        ))}
      </div>
    </Region>
  );
}

/** Lignes de la liste des conversations. */
export function ConversationListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Region label="Chargement des conversations" className="space-y-1">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl p-3">
          <Bone className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-3 w-2/3 bg-white/10" />
            <Bone className="h-2.5 w-full" />
            <Bone className="h-2 w-16" />
          </div>
        </div>
      ))}
    </Region>
  );
}

/** Fil de messages en cours de chargement : bulles alternées. */
export function ConversationSkeleton() {
  const bubbles = [
    { own: false, width: "w-2/3" },
    { own: false, width: "w-1/3" },
    { own: true, width: "w-1/2" },
    { own: false, width: "w-3/5" },
    { own: true, width: "w-2/5" },
    { own: true, width: "w-1/4" },
  ];
  return (
    <Region label="Chargement des messages" className="min-h-0 flex-1 overflow-hidden px-4 py-6 sm:px-8">
      <div className="space-y-5">
        {bubbles.map((bubble, index) => (
          <div key={index} className={`flex items-end gap-2 ${bubble.own ? "justify-end" : "justify-start"}`}>
            {!bubble.own && <Bone className="size-7 shrink-0 rounded-full" />}
            <div className={`${bubble.width} max-w-[78%] space-y-1.5`}>
              <Bone className={`h-11 rounded-2xl ${bubble.own ? "bg-tertiary-500/12" : ""}`} />
              <Bone className={`h-2 w-10 ${bubble.own ? "ml-auto" : ""}`} />
            </div>
          </div>
        ))}
      </div>
    </Region>
  );
}

/** Rendez-vous liés à une conversation (panneau de détails). */
export function ConversationRdvSkeleton() {
  return (
    <Region label="Chargement des rendez-vous" className="space-y-1.5">
      {[0, 1].map((index) => (
        <div key={index} className="flex items-center gap-2.5 rounded-xl bg-white/5 px-2.5 py-2">
          <Bone className="h-13 w-11 shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-3 w-3/4 bg-white/10" />
            <Bone className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </Region>
  );
}
