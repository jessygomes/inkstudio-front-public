"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FaEdit, FaPlus, FaTimes } from "react-icons/fa";
import imageCompression from "browser-image-compression";
import AppButton from "../Shared/AppButton";
import { useUploadThing } from "@/lib/utils/uploadthing";

type MoodboardAddImageModalProps = {
  isOpen: boolean;
  moodboardName: string;
  imageCaption: string;
  onImageCaptionChange: (value: string) => void;
  addingImage: boolean;
  onAddImage: (uploadedUrl: string) => Promise<boolean>;
  onClose: () => void;
};

export default function MoodboardAddImageModal({
  isOpen,
  moodboardName,
  imageCaption,
  onImageCaptionChange,
  addingImage,
  onAddImage,
  onClose,
}: MoodboardAddImageModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");

  const { startUpload, isUploading } = useUploadThing("imageUploader");

  const resetLocalImageState = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setLocalImageFile(null);
    setLocalPreviewUrl("");
    setFileError("");
  };

  const handleClose = () => {
    resetLocalImageState();
    onClose();
  };

  const handleLocalImageSelection = (fileList: FileList | null) => {
    if (!fileList?.length) return;

    const file = fileList[0];
    if (!file.type.startsWith("image/")) {
      setFileError("Le fichier sélectionné n'est pas une image.");
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("L'image dépasse 20 Mo. Choisissez un fichier plus léger.");
      return;
    }

    setFileError("");

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    const preview = URL.createObjectURL(file);
    setLocalImageFile(file);
    setLocalPreviewUrl(preview);
  };

  const handleAddImageWithUpload = async () => {
    if (!localImageFile) return;
    setFileError("");

    try {
      const compressed = await imageCompression(localImageFile, {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.78,
      });

      const uploaded = await startUpload([compressed]);
      const uploadedUrl = uploaded?.[0]?.url;

      if (!uploadedUrl) {
        setFileError("Impossible d'uploader l'image. Réessayez.");
        return;
      }

      const ok = await onAddImage(uploadedUrl);
      if (ok) {
        handleClose();
      } else {
        setFileError("Impossible d'ajouter l'image au moodboard.");
      }
    } catch (error) {
      console.error("Erreur upload image moodboard:", error);
      setFileError("Une erreur est survenue pendant l'upload.");
    }
  };

  useEffect(() => {
    setIsMounted(true);

    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, []);

  if (!isMounted || !isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-noir-700/75 p-0 backdrop-blur-sm sm:p-4">
      <div className="h-screen w-screen overflow-hidden border-0 border-white/12 bg-noir-700 shadow-2xl sm:h-auto sm:w-full sm:max-w-2xl sm:rounded-3xl sm:border">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 font-one">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-tertiary-400/25 bg-tertiary-500/15">
              <FaEdit className="h-3 w-3 text-tertiary-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-widest">Ajouter une image</p>
              <p className="text-[11px] text-white/55">Moodboard {moodboardName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/75 transition-all hover:bg-white/10"
            aria-label="Fermer la modale"
          >
            <FaTimes className="h-3 w-3" />
          </button>
        </div>

        <div className="flex h-[calc(100vh-57px)] flex-col gap-3 overflow-y-auto p-4 sm:h-auto sm:p-5">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/4 p-3 sm:p-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-noir-700/70">
              {localPreviewUrl ? (
                <div className="relative h-72 w-full">
                  <Image
                    src={localPreviewUrl}
                    alt="Aperçu image à ajouter"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 900px"
                  />
                </div>
              ) : (
                <div className="flex h-44 items-center justify-center text-center text-white/55">
                  <p className="px-6 text-sm font-one">Sélectionnez une image pour voir un aperçu complet.</p>
                </div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLocalImageSelection(e.target.files)}
              className="block w-full cursor-pointer rounded-2xl border border-white/12 bg-white/5 px-3 py-2 text-xs text-white/75 file:mr-3 file:rounded-2xl file:border-0 file:bg-tertiary-500/25 file:px-3 file:py-1.5 file:text-xs file:text-tertiary-100 font-one"
            />
            {fileError && (
              <p className="text-xs text-red-300 font-one">{fileError}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-[0.14em] text-white/50 font-one">
              Annotation
            </label>
            <textarea
              value={imageCaption}
              onChange={(e) => onImageCaptionChange(e.target.value)}
              placeholder="Ex: Je voudrais la même couleur que celle-ci"
              rows={1}
              className="w-full resize-none rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-tertiary-400/40 font-one"
            />

            <AppButton
              disabled={addingImage || isUploading || !localImageFile}
              onClick={handleAddImageWithUpload}
              icon={
                addingImage || isUploading ? (
                  <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent"></span>
                ) : (
                  <FaPlus className="h-3 w-3" />
                )
              }
              fullWidth
              className="py-1 text-xs cursor-pointer"
            >
              Ajouter l'image
            </AppButton>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
