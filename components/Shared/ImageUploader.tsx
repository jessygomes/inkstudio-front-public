"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SalonImageUploaderProps {
  currentImage?: string;
  compact?: boolean;
  onFileSelect?: (file: File | null) => void;
  file?: File | null;
}

export default function ImageUploader({
  currentImage,
  compact = false,
  onFileSelect,
  file,
}: SalonImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  // Pour l'aperçu local
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const selectedFile = files[0];

    // Vérifier le type de fichier
    if (!selectedFile.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    // Vérifier la taille du fichier (max 8MB)
    const maxSize = 8 * 1024 * 1024; // 8MB
    if (selectedFile.size > maxSize) {
      alert("L'image est trop volumineuse. Taille maximale : 8MB");
      return;
    }

    if (onFileSelect) {
      onFileSelect(selectedFile);
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleRemoveFile = () => {
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  return (
    <div className={`w-full space-y-${compact ? "2" : "4"}`}>
      {/* Zone d'affichage et d'upload */}
      <div className={compact ? "space-y-2" : "flex gap-4"}>
        {/* Zone d'affichage de l'image actuelle ou du fichier local */}
        {(previewUrl || currentImage) && (
          <div
            className={`relative ${
              compact ? "w-full h-24" : "w-[250px] h-[250px]"
            } rounded-${compact ? "2xl" : "2xl"} overflow-hidden bg-white/10 ${
              compact ? "" : "shrink-0"
            }`}
          >
            <Image
              src={previewUrl || currentImage!}
              alt="Image uploadée"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className={`absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full ${
                compact ? "w-6 h-6 text-xs" : "w-8 h-8"
              } flex items-center justify-center transition-colors z-10`}
            >
              ✕
            </button>
          </div>
        )}

        {/* Zone d'upload */}
        <div
          className={`relative border border-dashed rounded-${compact ? "2xl" : "2xl"} ${compact ? "p-3" : "p-6"} text-center transition-colors ${
            compact ? "md" : "md"
          } ${compact ? "p-3" : "p-6"} text-center transition-colors ${
            compact ? "flex-1 min-h-[80px]" : "flex-1 min-h-[192px]"
          } flex items-center justify-center ${
            isDragOver
              ? "border-tertiary-400 bg-tertiary-400/10"
              : "border-white/30 bg-white/5"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className={`space-y-${compact ? "1" : "2"}`}>
            <div className={compact ? "text-2xl" : "text-4xl"}>📸</div>
            <div className="text-white/80">
              <div>
                <div
                  className={`font-medium font-one ${compact ? "text-xs" : "text-sm"}`}
                >
                  {currentImage || previewUrl
                    ? "Remplacer"
                    : compact
                      ? "Glissez ou cliquez"
                      : "Glissez une image ici ou cliquez pour sélectionner"}
                </div>
                <div
                  className={`${
                    compact ? "text-[10px]" : "text-xs"
                  } text-white/60 mt-1`}
                >
                  {compact
                    ? "JPG, PNG, WebP"
                    : "Formats acceptés: JPG, PNG, WebP (max 8MB)"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages d'aide - adaptés au mode compact */}
      {compact && (previewUrl || currentImage) && (
        <div className="text-[10px] text-white/60">Image sélectionnée</div>
      )}

      {!compact && (previewUrl || currentImage) && (
        <div className="text-xs text-white/60">
          Aperçu : Cette image sera affichée
        </div>
      )}

      {/* Bouton de sélection alternatif - seulement en mode normal et sans image */}
      {!compact && !currentImage && !previewUrl && (
        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              handleFiles(target.files);
            };
            input.click();
          }}
          className="w-full py-3 px-4 bg-tertiary-400/20 hover:bg-tertiary-400/30 text-white rounded-[20px] border border-tertiary-400/50 transition-colors"
        >
          📷 Choisir une image
        </button>
      )}
    </div>
  );
}
