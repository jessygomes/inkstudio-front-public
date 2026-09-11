import Image from "next/image";
import { ArrowUpRight, Images, Trash2, LoaderCircle } from "lucide-react";
import type { Moodboard } from "@/lib/actions/moodboard.action";

type MoodboardCardProps = {
  moodboard: Moodboard;
  isActive: boolean;
  isDeleting: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function MoodboardCard({ moodboard, isActive, isDeleting, onOpen, onDelete }: MoodboardCardProps) {
  const previews = (moodboard.images || []).filter((image) => image.url).slice(0, 3);
  const imageCount = moodboard.images?.length || 0;
  return (
    <article className={`group min-w-0 overflow-hidden rounded-2xl border bg-noir-500 font-one transition-colors ${isActive ? "border-tertiary-400/40" : "border-white/10 hover:border-white/25"}`}>
      <button type="button" onClick={() => onOpen(moodboard.id)} disabled={isDeleting} aria-label={`Ouvrir ${moodboard.name}, ${imageCount} images`} className="block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tertiary-400 disabled:opacity-50">
        <div className={`relative grid aspect-[16/9] gap-1 overflow-hidden bg-noir-700 ${previews.length > 1 ? "grid-cols-[2fr_1fr]" : "grid-cols-1"}`}>
          {previews.length > 0 ? previews.map((image, index) => <div key={image.id} className={`relative overflow-hidden ${index === 0 && previews.length === 3 ? "row-span-2" : ""}`}><Image src={image.url} alt="" fill sizes="(min-width:1280px) 25vw, (min-width:640px) 40vw, 100vw" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /></div>) : <div className="grid place-items-center bg-linear-to-br from-tertiary-400/8 to-transparent text-white/30"><Images size={32} /></div>}
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[11px] text-white backdrop-blur-sm"><Images size={12} />{imageCount}</span>
        </div>
        <div className="px-4 pb-2 pt-4"><div className="flex items-start justify-between gap-3"><h4 className="break-words text-base font-semibold text-white">{moodboard.name}</h4><ArrowUpRight size={17} className="mt-0.5 shrink-0 text-white/35 group-hover:text-tertiary-400" /></div><p className="mt-1 line-clamp-2 min-h-10 break-words text-xs leading-5 text-white/50">{moodboard.description || "Rassemblez ici vos prochaines inspirations."}</p></div>
      </button>
      <div className="mx-4 flex items-center justify-between gap-2 border-t border-white/8 py-2">
        <span className="text-xs text-white/45">{imageCount} image{imageCount > 1 ? "s" : ""}{moodboard.appointments?.length ? ` · ${moodboard.appointments.length} RDV lié${moodboard.appointments.length > 1 ? "s" : ""}` : ""}</span>
        <button type="button" onClick={() => onDelete(moodboard.id)} disabled={isDeleting} aria-label={`Supprimer ${moodboard.name}`} title="Supprimer le moodboard" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-lg text-white/40 transition hover:bg-red-400/10 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-tertiary-400 disabled:opacity-50">{isDeleting ? <LoaderCircle size={15} className="motion-safe:animate-spin" /> : <Trash2 size={15} />}</button>
      </div>
    </article>
  );
}
