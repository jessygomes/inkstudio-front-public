"use client";
/* eslint-disable @next/next/no-img-element -- Object URLs preview local files before upload. */
import { useEffect, useRef } from "react";

interface ReferenceImagesProps { referenceFile?: File | null; sketchFile?: File | null; }

export default function ReferenceImages({ referenceFile, sketchFile }: ReferenceImagesProps) {
  if (!referenceFile && !sketchFile) return null;
  return <div className="mt-4 border-t border-white/8 pt-4"><p className="mb-3 text-[10px] uppercase tracking-wider text-white/40">Vos inspirations</p><div className="grid gap-2">{referenceFile && <FilePreview file={referenceFile} label="Référence principale" />}{sketchFile && <FilePreview file={sketchFile} label="Croquis / seconde référence" />}</div></div>;
}

function FilePreview({ file, label }: { file: File; label: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (imageRef.current) imageRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/8 bg-noir-800/40 p-2"><img ref={imageRef} alt={label} className="size-12 shrink-0 rounded-lg bg-white/5 object-cover" /><div className="min-w-0"><p className="text-[10px] text-white/40">{label}</p><p className="mt-1 truncate text-[11px] text-white/75">{file.name}</p></div></div>;
}
