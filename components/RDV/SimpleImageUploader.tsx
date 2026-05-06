"use client";

import { useState } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";

interface SimpleImageUploaderProps {
  label: string;
  currentImage?: string;
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
}

export default function SimpleImageUploader({
  label,
  currentImage,
  onImageUpload,
  onImageRemove,
}: SimpleImageUploaderProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: { url: string; key: string }[]) => {
      if (res && res[0]) {
        onImageUpload(res[0].url);
      }
      setProgress(100);
    },
    onUploadProgress: (p: number) => setProgress(p),
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
    },
  });

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const file = files[0];

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image valide");
      return;
    }

    // Vérifier la taille du fichier (max 15MB)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      alert("L'image est trop volumineuse. Taille maximale : 15MB");
      return;
    }

    try {
      // Compression agressive mais visuellement propre pour optimiser le stockage.
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.78,
      });

      await startUpload([compressed]);
    } catch (error) {
      console.error("Erreur lors de la compression:", error);
      alert("Erreur lors du traitement de l'image");
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

  return (
    <div className="space-y-3">
      <label className="text-sm text-white/90 font-one font-semibold">
        {label}
      </label>
      <div className="bg-linear-to-br from-white/8 to-white/2 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
        {/* Zone d'affichage de l'image */}
        {currentImage && (
          <div className="relative w-full h-24 rounded-lg overflow-hidden bg-white/10 mb-3">
            <Image
              src={currentImage}
              alt="Image uploadée"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={onImageRemove}
              className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center transition-colors z-10"
            >
              ✕
            </button>
          </div>
        )}

        {/* Zone d'upload */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-3 text-center transition-colors flex-1 min-h-20 flex items-center justify-center ${
            isDragOver
              ? "border-tertiary-400 bg-tertiary-400/10"
              : "border-white/30 bg-white/5"
          } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="space-y-1">
            <div className="text-2xl">📸</div>
            <div className="text-white/80">
              {isUploading ? (
                <div>
                  <div className="text-xs">Upload... {progress}%</div>
                  <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                    <div
                      className="bg-tertiary-400 rounded-full transition-all duration-300 h-1"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium text-xs">
                    {currentImage ? "Remplacer" : "Glissez ou cliquez"}
                  </div>
                  <div className="text-[10px] text-white/60 mt-1">
                    JPG, PNG, WebP
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
