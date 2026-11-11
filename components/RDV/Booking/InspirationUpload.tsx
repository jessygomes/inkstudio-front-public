"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { focusRing } from "./ui";

const MAX_SIZE = 8 * 1024 * 1024;

/** Tuile d'ajout d'image (sans contour) avec aperçu et suppression. */
export default function InspirationUpload({ file, onChange, label }: { file: File | null; onChange: (file: File | null) => void; label: string }) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronise l'aperçu avec l'URL objet créée pour ce fichier.
    setPreview(url);
    return () => { URL.revokeObjectURL(url); setPreview(null); };
  }, [file]);

  const pick = (files: FileList | null) => {
    const selected = files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) { setError("Choisissez une image (JPG, PNG, WebP)."); return; }
    if (selected.size > MAX_SIZE) { setError("Image trop lourde : 8 Mo maximum."); return; }
    setError("");
    onChange(selected);
  };

  return (
    <div className="min-w-0">
      {file && preview ? (
        <div className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-white/5">
          <Image src={preview} alt={label} fill unoptimized sizes="(max-width: 640px) 90vw, 300px" className="object-cover" />
          <span className="absolute inset-x-0 bottom-0 truncate bg-linear-to-t from-noir-900/80 to-transparent px-3 pb-2 pt-6 text-[11px] text-white/85">{file.name}</span>
          <button type="button" onClick={() => onChange(null)} aria-label={`Retirer ${label.toLowerCase()}`} className={`absolute right-2 top-2 grid size-8 place-items-center rounded-xl bg-noir-900/70 text-white backdrop-blur transition hover:bg-red-500 ${focusRing}`}><X size={14} /></button>
        </div>
      ) : (
        <label htmlFor={id}
          onDragOver={event => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={event => { event.preventDefault(); setDragging(false); pick(event.dataTransfer.files); }}
          className={`flex aspect-4/3 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center transition focus-within:ring-2 focus-within:ring-tertiary-400/50 ${dragging ? "bg-tertiary-400/15" : "bg-white/4 hover:bg-white/7"}`}>
          <span aria-hidden="true" className="grid size-11 place-items-center rounded-2xl bg-linear-to-br from-tertiary-400/20 to-cuatro-500/15 text-tertiary-400"><ImagePlus size={18} /></span>
          <span className="text-xs font-medium text-white/80">{label}</span>
          <span className="text-[10px] text-white/40">Glissez ou touchez · JPG, PNG, WebP</span>
          <input id={id} type="file" accept="image/*" className="sr-only" onChange={event => { pick(event.target.files); event.target.value = ""; }} />
        </label>
      )}
      {error && <p role="alert" className="mt-1.5 px-1 text-[11px] text-red-300">{error}</p>}
    </div>
  );
}
