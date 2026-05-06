"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AppButton from "./AppButton";

type ConfirmActionModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmActionModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  intent = "danger",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !isMounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isMounted]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isMounted || !isOpen) return null;

  const confirmClass =
    intent === "danger"
      ? "inline-flex items-center justify-center rounded-2xl border border-red-400/35 bg-red-500/15 px-5 py-2 text-sm font-one text-red-200 transition-all hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
      : "inline-flex items-center justify-center rounded-2xl border border-tertiary-400/35 bg-tertiary-500/20 px-5 py-2 text-sm font-one text-tertiary-100 transition-all hover:bg-tertiary-500/30 disabled:cursor-not-allowed disabled:opacity-50";

  return createPortal(
    <div
      className="fixed inset-0 z-120 flex items-center justify-center bg-noir-700/75 p-3 backdrop-blur-sm sm:p-4"
      onClick={() => {
        if (!loading) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/12 bg-noir-700 p-4 shadow-2xl sm:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-2">
          <h3 className="font-one text-base font-semibold text-white sm:text-lg">{title}</h3>
          {description && <p className="font-one text-sm text-white/65">{description}</p>}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <AppButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="w-full cursor-pointer px-3 py-2 text-xs"
          >
            {cancelLabel}
          </AppButton>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`${confirmClass} w-full cursor-pointer`}
          >
            {loading ? "Traitement..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
