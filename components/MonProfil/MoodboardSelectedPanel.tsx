"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FaArrowLeft, FaPlus, FaSave, FaTrash } from "react-icons/fa";
import { Moodboard } from "@/lib/actions/moodboard.action";
import AppButton from "../Shared/AppButton";
import MoodboardAddImageModal from "./MoodboardAddImageModal";

type MoodboardSelectedPanelProps = {
  selectedMoodboard: Moodboard;
  editName: string;
  editDescription: string;
  onEditNameChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  savingInfos: boolean;
  onSaveInfos: () => void;
  onBack: () => void;
  imageCaption: string;
  onImageCaptionChange: (value: string) => void;
  addingImage: boolean;
  onAddImage: (uploadedUrl: string) => Promise<boolean>;
  deletingImageId: string | null;
  onDeleteImage: (imageId: string) => void;
};

export default function MoodboardSelectedPanel({
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
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const activeImages = useMemo(
    () =>
      (selectedMoodboard.images || [])
        .map((image) => image.url)
        .filter(Boolean) as string[],
    [selectedMoodboard.images],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted, lightboxOpen]);

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
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-linear-to-br from-noir-500/6 to-white/3 p-4 shadow-xl backdrop-blur-lg sm:p-6 font-one">
      <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label="Retour à la liste des moodboards"
          >
            <FaArrowLeft className="h-3 w-3" />
          </button>
          <h4 className="font-one text-base font-semibold text-white sm:text-lg">
            Détails du moodboard
          </h4>
        </div>
        <span className="w-fit rounded-xl border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 font-one sm:ml-auto">
          {selectedMoodboard.images?.length || 0} image
          {(selectedMoodboard.images?.length || 0) > 1 ? "s" : ""}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
        <input
          type="text"
          value={editName}
          onChange={(e) => onEditNameChange(e.target.value)}
          placeholder="Nom"
          className="min-w-0 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-tertiary-400/40"
        />
        <input
          type="text"
          value={editDescription}
          onChange={(e) => onEditDescriptionChange(e.target.value)}
          placeholder="Description"
          className="min-w-0 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-tertiary-400/40"
        />
        <div className="grid grid-cols-2 gap-2 md:col-span-2 xl:col-auto">
        <AppButton
          variant="secondary"
          disabled={savingInfos}
          onClick={onSaveInfos}
          icon={
            savingInfos ? (
              <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></span>
            ) : (
              <FaSave className="h-3 w-3" />
            )
          }
          className="cursor-pointer py-2 text-xs md:w-full xl:w-auto"
        >
          Sauvegarder
        </AppButton>

        <AppButton
          variant="secondary"
          onClick={() => setIsAddImageModalOpen(true)}
          icon={<FaPlus className="h-3 w-3" />}
          className="cursor-pointer py-2 text-xs md:w-full xl:w-auto"
        >
          image
        </AppButton>
        </div>
      </div>

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
        <div className="rounded-2xl border border-white/10 bg-white/5 py-10 text-center">
          <p className="text-sm text-white/60 font-one">
            Aucune image dans ce moodboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {selectedMoodboard.images.map((image, index) => (
            <div
              key={image.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <button
                type="button"
                onClick={() => openLightbox(index)}
                className="relative h-48 w-full cursor-zoom-in sm:h-44 lg:h-40"
                aria-label={`Agrandir l'image ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={image.caption || "Image moodboard"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              </button>
              <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3">
                <p className="line-clamp-2 text-xs text-white/70 font-one sm:line-clamp-1">
                  {image.caption || "Sans légende"}
                </p>
                <button
                  type="button"
                  onClick={() => onDeleteImage(image.id)}
                  className="cursor-pointer inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 text-red-300 transition-all hover:bg-red-500/20"
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

      {isMounted &&
        lightboxOpen &&
        createPortal(
          <div
            role="dialog"
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
                className="absolute top-3 right-3 rounded-2xl border border-white/20 bg-white/10 px-2 py-0.5 text-white hover:bg-white/20"
              >
                ✕
              </button>

              {activeImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Précédent"
                    className="absolute left-3 top-1/2 rounded-2xl border border-white/20 bg-white/10 px-3 pb-0.5 text-2xl text-white -translate-y-1/2 hover:bg-white/20"
                  >
                    ‹
                  </button>
                  <button
                    onClick={next}
                    aria-label="Suivant"
                    className="absolute right-3 top-1/2 rounded-2xl border border-white/20 bg-white/10 px-3 pb-0.5 text-2xl text-white -translate-y-1/2 hover:bg-white/20"
                  >
                    ›
                  </button>
                  <div className="absolute bottom-3 left-1/2 rounded-2xl bg-black/30 px-2 py-1 text-[11px] text-white/80 font-one -translate-x-1/2">
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
