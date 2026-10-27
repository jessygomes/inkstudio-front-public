"use client";

import { useCallback, useEffect, useMemo, useRef, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, Expand } from "lucide-react";
import Image from "next/image";
import { FaArrowLeft, FaPlus, FaSave, FaTrash } from "react-icons/fa";
import { Moodboard } from "@/lib/actions/moodboard.action";
import AppButton from "../Shared/AppButton";
import MoodboardAddImageModal from "./MoodboardAddImageModal";
import ProjectPublication from "./ProjectPublication";
import type { ProjectFields } from "./ProjectPublication";
import ProjectProposals from "./ProjectProposals";


type MoodboardSelectedPanelProps = {
  onProjectUpdated: (fields: ProjectFields) => void;
  selectedMoodboard: Moodboard;
  editName: string;
  editDescription: string;
  onEditNameChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  savingInfos: boolean;
  onSaveInfos: () => Promise<boolean>;
  onBack: () => void;
  imageCaption: string;
  onImageCaptionChange: (value: string) => void;
  addingImage: boolean;
  onAddImage: (uploadedUrl: string) => Promise<boolean>;
  deletingImageId: string | null;
  onDeleteImage: (imageId: string) => void;
};

export default function MoodboardSelectedPanel({
  onProjectUpdated,
  selectedMoodboard,
  editName,
  editDescription,
  onEditNameChange,
  onEditDescriptionChange,
  savingInfos,
  onSaveInfos,
  onBack,
  imageCaption,
  onImageCaptionChange,
  addingImage,
  onAddImage,
  deletingImageId,
  onDeleteImage,
}: MoodboardSelectedPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const formId = useId();
  const lightboxRef = useRef<HTMLDivElement>(null);
  const hasChanges = editName !== selectedMoodboard.name || editDescription !== (selectedMoodboard.description || "");

  const activeImages = useMemo(
    () =>
      (selectedMoodboard.images || [])
        .map((image) => image.url)
        .filter(Boolean) as string[],
    [selectedMoodboard.images],
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    lightboxRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [lightboxOpen]);

  const openLightbox = useCallback(
    (startIndex = 0) => {
      if (activeImages.length === 0) return;
      setLightboxIndex(Math.max(0, Math.min(startIndex, activeImages.length - 1)));
      setLightboxOpen(true);
    },
    [activeImages.length],
  );

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prev = useCallback(
    () => setLightboxIndex((index) => (index - 1 + activeImages.length) % activeImages.length),
    [activeImages.length],
  );
  const next = useCallback(
    () => setLightboxIndex((index) => (index + 1) % activeImages.length),
    [activeImages.length],
  );

  const onLightboxKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!lightboxOpen) return;
    if (e.key === "Tab") {
      const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  return (
    <div className="space-y-5 font-one [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-tertiary-400">
      <div className="pb-3">
        {isEditing ? (
          <form onSubmit={async (event) => { event.preventDefault(); if (!savingInfos && await onSaveInfos()) setIsEditing(false); }} className="space-y-2.5" aria-busy={savingInfos}>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={onBack} aria-label="Tous mes moodboards" title="Tous mes moodboards" className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white"><FaArrowLeft size={13} /></button>
              <label htmlFor={`${formId}-name`} className="sr-only">Nom du moodboard</label>
              <input autoFocus id={`${formId}-name`} value={editName} onChange={(event) => onEditNameChange(event.target.value)} required disabled={savingInfos} className="h-9 min-w-0 flex-1 rounded-lg border border-white/15 bg-noir-800 px-3 text-sm text-white outline-none focus:border-tertiary-400" />
              <span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/45">{selectedMoodboard.images?.length || 0}</span>
              <button type="button" disabled={savingInfos} onClick={() => { onEditNameChange(selectedMoodboard.name); onEditDescriptionChange(selectedMoodboard.description || ""); setIsEditing(false); }} className="h-9 cursor-pointer rounded-lg border border-white/10 px-3 text-xs text-white/60 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">Annuler</button>
              <AppButton type="submit" variant="secondary" disabled={savingInfos || !editName.trim()} icon={<FaSave size={12} />} className="h-9 cursor-pointer !rounded-lg !px-3 !py-0 !text-xs">{savingInfos ? "Enregistrement…" : "Valider"}</AppButton>
            </div>
            <label htmlFor={`${formId}-description`} className="sr-only">Description (facultative)</label>
            <textarea id={`${formId}-description`} value={editDescription} onChange={(event) => onEditDescriptionChange(event.target.value)} rows={2} placeholder="Description (facultative)" disabled={savingInfos} className="w-full resize-y rounded-lg border border-white/15 bg-noir-800 px-3 py-2 text-xs text-white outline-none placeholder:text-white/35 focus:border-tertiary-400" />
            {hasChanges && <p className="text-[11px] text-white/45">Modifications non enregistrées</p>}
          </form>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2"><button type="button" onClick={onBack} aria-label="Tous mes moodboards" title="Tous mes moodboards" className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white"><FaArrowLeft size={13} /></button><h3 className="min-w-0 break-words text-base font-medium text-white">{selectedMoodboard.name}</h3><span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/45">{selectedMoodboard.images?.length || 0}</span></div>
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                <ProjectPublication board={selectedMoodboard} onUpdated={onProjectUpdated} />
                <button type="button" onClick={() => { onEditNameChange(selectedMoodboard.name); onEditDescriptionChange(selectedMoodboard.description || ""); setIsEditing(true); }} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"><Pencil size={12} />Modifier</button>
                <AppButton type="button" onClick={() => setIsAddImageModalOpen(true)} icon={<FaPlus size={11} />} className="h-8 cursor-pointer !rounded-lg !px-3 !py-0 !text-xs">Ajouter une image</AppButton>
              </div>
            </div>
            {selectedMoodboard.description && <p className="mt-2 whitespace-pre-line break-words text-xs leading-5 text-white/55">{selectedMoodboard.description}</p>}
          </>
        )}
      </div>

      <ProjectProposals moodboardId={selectedMoodboard.id} />

      <MoodboardAddImageModal
        isOpen={isAddImageModalOpen}
        moodboardName={selectedMoodboard.name}
        imageCaption={imageCaption}
        onImageCaptionChange={onImageCaptionChange}
        addingImage={addingImage}
        onAddImage={onAddImage}
        onClose={() => setIsAddImageModalOpen(false)}
      />

      {(selectedMoodboard.images || []).length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-noir-500 px-4 py-12 text-center">
          <p className="text-sm text-white/60 font-one">
            Votre moodboard attend ses premières inspirations.
          </p>
        </div>
      ) : (
        <div className="grid items-start gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {selectedMoodboard.images.map((image, index) => (
            <div
              key={image.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <button
                type="button"
                onClick={() => openLightbox(index)}
                className="relative block aspect-[4/5] w-full cursor-zoom-in bg-noir-800"
                aria-label={`Agrandir l'image ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={image.caption || "Image moodboard"}
                  fill
                  className="object-contain p-2 transition-transform duration-300 motion-safe:group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                <span className="min-h-11 min-w-11 cursor-pointer absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-lg bg-black/50 text-white"><Expand size={13} aria-hidden="true" /></span>
              </button>
              <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3">
                <p className="line-clamp-2 text-xs text-white/70 font-one sm:line-clamp-1">
                  {image.caption || "Sans légende"}
                </p>
                <button
                  type="button"
                  onClick={() => onDeleteImage(image.id)}
                  disabled={deletingImageId !== null}
                  aria-label={`Supprimer ${image.caption || `l’image ${index + 1}`}`}
                  className="cursor-pointer inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/40 transition-all hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                >
                  {deletingImageId === image.id ? (
                    <span className="h-3 w-3 animate-spin rounded-full border border-red-300 border-t-transparent"></span>
                  ) : (
                    <FaTrash size={10} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightboxOpen &&
        createPortal(
          <div
            role="dialog"
            ref={lightboxRef}
            aria-label={`Images de ${selectedMoodboard.name}`}
            aria-modal="true"
            className="fixed inset-0 z-100000 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onKeyDown={onLightboxKey}
            tabIndex={-1}
            onClick={closeLightbox}
          >
            <div
              className="relative flex h-full max-h-[86vh] w-full max-w-[92vw] items-center justify-center rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-full w-full rounded-xl">
                <Image
                  src={activeImages[lightboxIndex]}
                  alt={`Image moodboard ${lightboxIndex + 1}/${activeImages.length}`}
                  fill
                  className="rounded-xl object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              <button
                onClick={closeLightbox}
                aria-label="Fermer"
                className="min-h-11 min-w-11 cursor-pointer absolute top-3 right-3 rounded-2xl border border-white/20 bg-white/10 px-2 py-0.5 text-white hover:bg-white/20"
              >
                ✕
              </button>

              {activeImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Précédent"
                    className="min-h-11 min-w-11 cursor-pointer absolute left-3 top-1/2 rounded-2xl border border-white/20 bg-white/10 px-3 pb-0.5 text-2xl text-white -translate-y-1/2 hover:bg-white/20"
                  >
                    ‹
                  </button>
                  <button
                    onClick={next}
                    aria-label="Suivant"
                    className="min-h-11 min-w-11 cursor-pointer absolute right-3 top-1/2 rounded-2xl border border-white/20 bg-white/10 px-3 pb-0.5 text-2xl text-white -translate-y-1/2 hover:bg-white/20"
                  >
                    ›
                  </button>
                  <div className="min-h-11 min-w-11 cursor-pointer absolute bottom-3 left-1/2 rounded-2xl bg-black/30 px-2 py-1 text-[11px] text-white/80 font-one -translate-x-1/2">
                    {lightboxIndex + 1} / {activeImages.length}
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
