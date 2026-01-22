"use client";

import React, { useState, useEffect } from "react";

interface ReferenceImagesProps {
  referenceFile?: File | null;
  sketchFile?: File | null;
}

export default function ReferenceImages({
  referenceFile,
  sketchFile,
}: ReferenceImagesProps) {
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const [sketchUrl, setSketchUrl] = useState<string | null>(null);

  // Créer les URLs des objets pour les fichiers
  useEffect(() => {
    if (referenceFile) {
      const url = URL.createObjectURL(referenceFile);
      setReferenceUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [referenceFile]);

  useEffect(() => {
    if (sketchFile) {
      const url = URL.createObjectURL(sketchFile);
      setSketchUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [sketchFile]);

  if (!referenceFile && !sketchFile) return null;

  return (
    <div>
      <p className="text-white/60 font-one text-sm mb-2">Images de référence</p>
      <div className="flex gap-2">
        {referenceUrl && (
          <div className="w-20 h-20 rounded overflow-hidden border border-white/10">
            <img
              src={referenceUrl}
              alt="Référence"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {sketchUrl && (
          <div className="w-20 h-20 rounded overflow-hidden border border-white/10">
            <img
              src={sketchUrl}
              alt="Sketch"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
