import Image from "next/image";
import { FaChevronRight, FaImages, FaTrash } from "react-icons/fa";
import { Moodboard } from "@/lib/actions/moodboard.action";

type MoodboardCardProps = {
  moodboard: Moodboard;
  isActive: boolean;
  isDeleting: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function MoodboardCard({
  moodboard,
  isActive,
  isDeleting,
  onOpen,
  onDelete,
}: MoodboardCardProps) {
  const firstImage = moodboard.images?.[0]?.url;
  const imageCount = moodboard.images?.length || 0;

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300  ${
        isActive
          ? "border-tertiary-500/40 bg-tertiary-500/12 shadow-[0_12px_30px_-20px_var(--color-tertiary-500)]"
          : "border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(moodboard.id)}
        className="w-full text-left cursor-pointer"
      >
        <div className="relative h-16 w-full overflow-hidden border-b border-white/8 bg-linear-to-r from-tertiary-500/20 via-tertiary-400/10 to-noir-700/20">
          {firstImage ? (
            <>
              <Image
                src={firstImage}
                alt={`Aperçu ${moodboard.name}`}
                fill
                sizes="100vw"
                className="object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-linear-to-r from-noir-700/35 via-noir-700/15 to-noir-700/45"></div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FaImages className="h-4 w-4 text-white/55" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-3 py-3">
          <div className="min-w-0">
            <p className="truncate font-one text-sm font-semibold text-white">
              {moodboard.name}
            </p>
            <p className="mt-0.5 text-xs text-white/55 font-one">
              {imageCount} image{imageCount > 1 ? "s" : ""}
            </p>
          </div>

          <div className="rounded-xl border border-white/12 bg-white/6 p-2">
            <FaChevronRight className="h-3 w-3 text-white/55" />
          </div>
        </div>
      </button>

      <div className="border-t border-white/8 px-2.5 py-2">
        <button
          type="button"
          onClick={() => onDelete(moodboard.id)}
          disabled={isDeleting}
          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10 text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={`Supprimer ${moodboard.name}`}
        >
          {isDeleting ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-red-300 border-t-transparent"></span>
          ) : (
            <FaTrash size={12} />
          )}
        </button>
      </div>
    </div>
  );
}
