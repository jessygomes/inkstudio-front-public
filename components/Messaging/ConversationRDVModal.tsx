"use client";

import React, { useEffect, useRef } from "react";

import ConversationRDVDetails from "@/components/Messaging/ConversationRDVDetails";
import { ConversationDto } from "@/lib/type";

interface ConversationRDVModalProps {
  conversation: ConversationDto;
  onClose: () => void;
}

export default function ConversationRDVModal({
  conversation,
  onClose,
}: ConversationRDVModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;

    dialog?.showModal();

    return () => {
      dialog?.close();
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-label="Détails du rendez-vous"
      className="fixed inset-0 m-0 max-h-none max-w-none overflow-hidden bg-noir-700 p-0 text-white backdrop:bg-black/60 lg:hidden"
      style={{
        height: "100dvh",
        width: "100vw",
      }}
    >
      <div className="w-full h-full">
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-linear-to-br from-noir-500 to-noir-700">
          <div className="flex-1 overflow-y-auto min-h-0">
            <ConversationRDVDetails conversation={conversation} />
          </div>

          <div className="shrink-0 border-t border-white/10 bg-white/5 p-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full cursor-pointer rounded-lg border border-white/20 bg-white/10 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20 font-one"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
