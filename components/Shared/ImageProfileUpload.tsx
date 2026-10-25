"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/lib/utils/uploadthing";
import AppButton from "./AppButton";

interface SalonImageUploaderProps {
  currentImage?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
  compact?: boolean;
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

export default function SalonImageUploader({ currentImage, onImageUpload, onImageRemove, compact = false, disabled = false, onBusyChange }: SalonImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadProgress: setProgress,
  });
  const busy = processing || isUploading;
  const unavailable = disabled || busy;
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);

  async function upload(file?: File) {
    if (!file || unavailable) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choisissez une image JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Votre image dépasse 8 Mo. Choisissez un fichier plus léger.");
      return;
    }
    setProcessing(true);
    setProgress(0);
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: "image/webp", initialQuality: 0.8 });
      const result = await startUpload([compressed]);
      if (!result?.[0]?.url) throw new Error("Envoi incomplet");
      onImageUpload(result[0].url);
    } catch {
      setError("Impossible d’ajouter cette photo. Réessayez avec une autre image.");
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return <div className="min-w-0 space-y-3" aria-busy={busy}>
    <div onDragOver={event => { event.preventDefault(); if (!unavailable) setDragging(true); }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={event => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files[0]); }} className={`flex min-w-0 flex-col items-center gap-4 rounded-2xl border bg-noir-700 p-4 transition-colors sm:flex-row sm:items-center sm:gap-5 sm:p-5 ${dragging ? "border-tertiary-400/60" : "border-white/10"}`}>
      <div className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/3 ring-4 ring-white/3 ${compact ? "size-24" : "size-28 sm:size-32"}`}>
        {currentImage ? <Image src={currentImage} alt="Aperçu de votre photo de profil" fill sizes={compact ? "96px" : "128px"} className="object-cover" /> : <Camera size={28} strokeWidth={1.3} aria-hidden="true" className="text-white/25" />}
        {busy && <span className="absolute inset-0 grid place-items-center bg-black/65"><LoaderCircle size={23} aria-hidden="true" className="animate-spin text-tertiary-400" /></span>}
      </div>
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <p className="text-xs font-semibold text-white/85">{dragging ? "Déposez votre nouvelle photo" : currentImage ? "Votre photo, votre touche personnelle" : "Ajoutez votre photo de profil"}</p>
        <p className="mt-1.5 text-[11px] leading-5 text-white/40"><span className="hidden sm:inline">Glissez votre image ici ou choisissez un fichier.</span><span className="sm:hidden">Choisissez une image dans votre galerie.</span></p>
        <p className="mt-1 text-[10px] text-white/30">JPG, PNG ou WebP · 8 Mo maximum</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <AppButton type="button" variant="secondary" disabled={unavailable} onClick={() => inputRef.current?.click()} icon={busy ? <LoaderCircle size={13} aria-hidden="true" className="animate-spin" /> : currentImage ? <Upload size={13} aria-hidden="true" /> : <ImagePlus size={13} aria-hidden="true" />} className="min-h-11 cursor-pointer !px-3 !py-2 !text-xs !shadow-none">{busy ? "Envoi en cours…" : currentImage ? "Changer la photo" : "Choisir une photo"}</AppButton>
          {currentImage && <button type="button" disabled={unavailable} onClick={() => { setError(""); onImageRemove(); }} className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[11px] text-white/40 transition hover:bg-red-400/5 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-tertiary-400 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={13} aria-hidden="true" />Retirer</button>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label={currentImage ? "Changer la photo de profil" : "Choisir une photo de profil"} aria-describedby={error ? errorId : undefined} disabled={unavailable} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ""; }} className="hidden" />
    </div>
    {busy && <div role="status" className="space-y-1.5"><p className="flex justify-between gap-2 text-[10px] text-white/45"><span>{isUploading ? "Envoi de la photo" : "Préparation de votre image"}</span>{isUploading && <span>{progress} %</span>}</p><div role="progressbar" aria-label="Envoi de la photo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={isUploading ? progress : undefined} className="h-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-tertiary-400 transition-[width]" style={{ width: `${isUploading ? progress : 0}%` }} /></div></div>}
    {error && <p id={errorId} role="alert" className="text-[11px] leading-5 text-red-300">{error}</p>}
    {currentImage && !busy && <p className="text-[10px] leading-5 text-white/35">Enregistrez votre profil pour confirmer le changement de photo.</p>}
  </div>;
}
