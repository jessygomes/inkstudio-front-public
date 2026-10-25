"use client";
import ProjectProposals from "./ProjectProposals";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { projectRequest, type ProjectProposal } from "@/lib/actions/projects.action";
import { toast } from "sonner";
import { ArrowLeft, MessageSquare } from "lucide-react";
import {
  addMoodboardImageAction,
  createMoodboardAction,
  deleteMoodboardAction,
  getMoodboardByIdAction,
  getMyMoodboardsAction,
  Moodboard,
  removeMoodboardImageAction,
  updateMoodboardAction,
} from "@/lib/actions/moodboard.action";
import {
  FaPlus,
} from "react-icons/fa";
import AppButton from "../Shared/AppButton";
import ConfirmActionModal from "../Shared/ConfirmActionModal";
import { extractUploadThingKey } from "@/lib/utils/extractUploadThingKey";
import MoodboardCreateModal from "./MoodboardCreateModal";
import MoodboardCard from "./MoodboardCard";
import MoodboardSelectedPanel from "./MoodboardSelectedPanel";

type ConfirmState =
  | {
      type: "deleteMoodboard";
      moodboardId: string;
      moodboardName: string;
    }
  | {
      type: "deleteImage";
      moodboardId: string;
      imageId: string;
    }
  | null;

export default function MoodboardTab() {
  const [moodboards, setMoodboards] = useState<Moodboard[]>([]);
  const [showAllProposals, setShowAllProposals] = useState(false);
  const [proposalCounts, setProposalCounts] = useState<Record<string, number> | null>(null);
  const handleProposalsLoaded = useCallback((proposals: ProjectProposal[]) => {
    const counts: Record<string, number> = {};
    for (const proposal of proposals) {
      const id = proposal.moodboardId || proposal.moodboard.id;
      counts[id] = (counts[id] || 0) + 1;
    }
    setProposalCounts(counts);
  }, []);
  useEffect(() => {
    let active = true;
    const refreshCounts = async () => {
      try {
        const proposals = await projectRequest<ProjectProposal[]>("/proposals");
        if (active) handleProposalsLoaded(proposals);
      } catch (error) {
        console.warn("Impossible de charger les compteurs de propositions", error);
      }
    };
    void refreshCounts();
    const timer = window.setInterval(() => void refreshCounts(), 30000);
    window.addEventListener("unreadCountRefresh", refreshCounts);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("unreadCountRefresh", refreshCounts);
    };
  }, [handleProposalsLoaded]);
  const [selectedMoodboardId, setSelectedMoodboardId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingInfos, setSavingInfos] = useState(false);
  const [deletingMoodboardId, setDeletingMoodboardId] = useState<string | null>(
    null,
  );

  const [imageCaption, setImageCaption] = useState("");
  const [addingImage, setAddingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const selectedMoodboard = useMemo(
    () => moodboards.find((m) => m.id === selectedMoodboardId) || null,
    [moodboards, selectedMoodboardId],
  );

  const deleteFromUploadThingByUrl = async (fileUrl: string): Promise<boolean> => {
    try {
      const key = extractUploadThingKey(fileUrl);
      if (!key) return false;

      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });

      return response.ok;
    } catch (error) {
      console.error("Erreur suppression UploadThing moodboard:", error);
      return false;
    }
  };

  const loadMoodboards = async () => {
    try {
      setLoading(true);
      const result = await getMyMoodboardsAction();

      if (!result.ok || !result.data) {
        toast.error(result.message || "Impossible de récupérer vos moodboards");
        setMoodboards([]);
        return;
      }

      const data = result.data;
      setMoodboards(data);

      if (
        selectedMoodboardId &&
        !data.some((moodboard) => moodboard.id === selectedMoodboardId)
      ) {
        setSelectedMoodboardId(null);
      }
    } catch (error) {
      console.error("Erreur load moodboards:", error);
      toast.error("Erreur lors du chargement des moodboards");
      setMoodboards([]);
    } finally {
      setLoading(false);
    }
  };

  const openMoodboard = async (moodboardId: string) => {
    try {
      setSelectedMoodboardId(moodboardId);
      const result = await getMoodboardByIdAction(moodboardId);

      if (result.ok && result.data) {
        setMoodboards((prev) =>
          prev.map((moodboard) =>
            moodboard.id === moodboardId
              ? { ...moodboard, ...result.data }
              : moodboard,
          ),
        );
      }
    } catch (error) {
      console.error("Erreur ouverture moodboard:", error);
      toast.error("Impossible d'ouvrir ce moodboard");
    }
  };

  useEffect(() => {
    loadMoodboards();
  }, []);

  useEffect(() => {
    if (!selectedMoodboard) {
      setEditName("");
      setEditDescription("");
      return;
    }

    setEditName(selectedMoodboard.name || "");
    setEditDescription(selectedMoodboard.description || "");
    setImageCaption("");
  }, [selectedMoodboardId, selectedMoodboard]);

  const handleCreateMoodboard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createName.trim()) {
      toast.error("Le nom du moodboard est obligatoire");
      return;
    }

    try {
      setCreating(true);
      const result = await createMoodboardAction({
        name: createName.trim(),
        description: createDescription.trim() || undefined,
      });

      if (!result.ok || !result.data) {
        toast.error(result.message || "Impossible de créer le moodboard");
        return;
      }

      setMoodboards((prev) => [result.data as Moodboard, ...prev]);
      setSelectedMoodboardId(result.data.id);
      setCreateName("");
      setCreateDescription("");
      setCreateModalOpen(false);
      toast.success("Moodboard créé");
    } catch (error) {
      console.error("Erreur création moodboard:", error);
      toast.error("Erreur lors de la création du moodboard");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveInfos = async (): Promise<boolean> => {
    if (!selectedMoodboard) return false;

    if (!editName.trim()) {
      toast.error("Le nom du moodboard est obligatoire");
      return false;
    }

    try {
      setSavingInfos(true);
      const result = await updateMoodboardAction(selectedMoodboard.id, {
        name: editName.trim(),
        description: editDescription.trim() || "",
      });

      if (!result.ok || !result.data) {
        toast.error(result.message || "Impossible de modifier le moodboard");
        return false;
      }

      setMoodboards((prev) =>
        prev.map((moodboard) =>
          moodboard.id === selectedMoodboard.id
            ? { ...moodboard, ...result.data }
            : moodboard,
        ),
      );
      toast.success("Informations du moodboard mises à jour");
      return true;
    } catch (error) {
      console.error("Erreur update moodboard:", error);
      toast.error("Erreur lors de la modification");
      return false;
    } finally {
      setSavingInfos(false);
    }
  };

  const executeDeleteMoodboard = async (moodboardId: string): Promise<boolean> => {
    try {
      setDeletingMoodboardId(moodboardId);
      const result = await deleteMoodboardAction(moodboardId);

      if (!result.ok) {
        toast.error(result.message || "Impossible de supprimer le moodboard");
        return false;
      }

      setMoodboards((prev) => prev.filter((m) => m.id !== moodboardId));
      if (selectedMoodboardId === moodboardId) {
        const remaining = moodboards.filter((m) => m.id !== moodboardId);
        setSelectedMoodboardId(remaining[0]?.id || null);
      }
      toast.success("Moodboard supprimé");
      return true;
    } catch (error) {
      console.error("Erreur suppression moodboard:", error);
      toast.error("Erreur lors de la suppression");
      return false;
    } finally {
      setDeletingMoodboardId(null);
    }
  };

  const handleDeleteMoodboard = (moodboardId: string) => {
    const moodboard = moodboards.find((item) => item.id === moodboardId);
    if (!moodboard) return;

    setConfirmState({
      type: "deleteMoodboard",
      moodboardId,
      moodboardName: moodboard.name,
    });
  };

  const handleAddImage = async (uploadedUrl: string): Promise<boolean> => {
    if (!selectedMoodboard) return false;
    if (!uploadedUrl) return false;

    try {
      setAddingImage(true);
      const result = await addMoodboardImageAction(selectedMoodboard.id, {
        url: uploadedUrl,
        caption: imageCaption.trim() || undefined,
        position: selectedMoodboard.images?.length || 0,
      });

      if (!result.ok || !result.data) {
        await deleteFromUploadThingByUrl(uploadedUrl);
        toast.error(result.message || "Impossible d'ajouter l'image");
        return false;
      }

      const createdImage = result.data;

      setMoodboards((prev) =>
        prev.map((moodboard) =>
          moodboard.id === selectedMoodboard.id
            ? {
                ...moodboard,
                images: [...(moodboard.images || []), createdImage],
              }
            : moodboard,
        ),
      );

      setImageCaption("");
      toast.success("Image ajoutée au moodboard");
      return true;
    } catch (error) {
      console.error("Erreur ajout image moodboard:", error);
      await deleteFromUploadThingByUrl(uploadedUrl);
      toast.error("Erreur lors de l'ajout de l'image");
      return false;
    } finally {
      setAddingImage(false);
    }
  };

  const executeDeleteImage = async (
    moodboardId: string,
    imageId: string,
  ): Promise<boolean> => {
    if (!selectedMoodboard) return false;

    const imageToDelete = selectedMoodboard.images?.find(
      (image) => image.id === imageId,
    );
    if (!imageToDelete) {
      toast.error("Image introuvable");
      return false;
    }

    try {
      setDeletingImageId(imageId);
      const result = await removeMoodboardImageAction(moodboardId, imageId);

      if (!result.ok) {
        toast.error(result.message || "Impossible de supprimer l'image");
        return false;
      }

      const uploadThingDeleted = await deleteFromUploadThingByUrl(
        imageToDelete.url,
      );
      if (!uploadThingDeleted) {
        toast.warning(
          "Image supprimée du moodboard, mais suppression UploadThing à vérifier",
        );
      }

      setMoodboards((prev) =>
        prev.map((moodboard) =>
          moodboard.id === moodboardId
            ? {
                ...moodboard,
                images: (moodboard.images || []).filter(
                  (image) => image.id !== imageId,
                ),
              }
            : moodboard,
        ),
      );
      toast.success("Image supprimée");
      return true;
    } catch (error) {
      console.error("Erreur suppression image moodboard:", error);
      toast.error("Erreur lors de la suppression de l'image");
      return false;
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    if (!selectedMoodboard) return;

    const image = selectedMoodboard.images?.find((item) => item.id === imageId);
    if (!image) {
      toast.error("Image introuvable");
      return;
    }

    setConfirmState({
      type: "deleteImage",
      moodboardId: selectedMoodboard.id,
      imageId,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmState) return;

    setConfirmLoading(true);
    try {
      let success = false;

      if (confirmState.type === "deleteMoodboard") {
        success = await executeDeleteMoodboard(confirmState.moodboardId);
      }

      if (confirmState.type === "deleteImage") {
        success = await executeDeleteImage(
          confirmState.moodboardId,
          confirmState.imageId,
        );
      }

      if (success) {
        setConfirmState(null);
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-linear-to-br from-noir-500/6 to-white/3 p-4 shadow-xl backdrop-blur-lg sm:p-6">
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-tertiary-400 border-t-transparent"></div>
          <p className="font-one text-white/60">Chargement des moodboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showAllProposals ? (
        <div className="space-y-4 font-one">
          <header className="flex min-w-0 items-center gap-2 pb-3">
            <button type="button" onClick={() => setShowAllProposals(false)} aria-label="Retour aux moodboards" title="Retour aux moodboards" className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-white/50 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400"><ArrowLeft size={17} aria-hidden="true" /></button>
            <h2 className="min-w-0 text-sm font-semibold text-white sm:text-base">Propositions pour vos projets</h2>
            {proposalCounts && <span className="ml-auto shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/45">{Object.values(proposalCounts).reduce((sum, count) => sum + count, 0)}</span>}
          </header>
          <ProjectProposals onLoaded={handleProposalsLoaded} />
        </div>
      ) : selectedMoodboard ? (
        <MoodboardSelectedPanel
          key={selectedMoodboard.id}
          selectedMoodboard={selectedMoodboard}
          onProjectUpdated={fields => setMoodboards(prev => prev.map(board => board.id === selectedMoodboard.id ? { ...board, ...fields } : board))}
          editName={editName}
          editDescription={editDescription}
          onEditNameChange={setEditName}
          onEditDescriptionChange={setEditDescription}
          savingInfos={savingInfos}
          onSaveInfos={handleSaveInfos}
          onBack={() => setSelectedMoodboardId(null)}
          imageCaption={imageCaption}
          onImageCaptionChange={setImageCaption}
          addingImage={addingImage}
          onAddImage={handleAddImage}
          deletingImageId={deletingImageId}
          onDeleteImage={handleDeleteImage}
        />
      ) : (
        <div className="font-one">
          <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          <AppButton type="button" onClick={() => setCreateModalOpen(true)} icon={<FaPlus size={11} />} className="min-h-11 cursor-pointer !px-4 !text-xs !shadow-none">Créer un moodboard</AppButton>

          <AppButton type="button" variant="secondary" onClick={() => setShowAllProposals(true)} icon={<MessageSquare size={14} />} className="min-h-11 shrink-0 cursor-pointer !px-3 !text-xs">
            Toutes les propositions
            {proposalCounts && <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">{Object.values(proposalCounts).reduce((sum, count) => sum + count, 0)}</span>}
          </AppButton>
          </div>

          {moodboards.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 py-10 text-center">
              <p className="font-one text-sm text-white/65">
                Aucun moodboard pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {moodboards.map((moodboard) => (
                <MoodboardCard
                  key={moodboard.id}
                  moodboard={moodboard}
                  proposalCount={proposalCounts ? proposalCounts[moodboard.id] || 0 : undefined}
                  isActive={selectedMoodboardId === moodboard.id}
                  isDeleting={deletingMoodboardId === moodboard.id}
                  onOpen={openMoodboard}
                  onDelete={handleDeleteMoodboard}
                  onProjectUpdated={fields => setMoodboards(prev => prev.map(board => board.id === moodboard.id ? { ...board, ...fields } : board))}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <MoodboardCreateModal open={createModalOpen} name={createName} description={createDescription} busy={creating} onNameChange={setCreateName} onDescriptionChange={setCreateDescription} onSubmit={handleCreateMoodboard} onClose={() => { if (!creating) { setCreateModalOpen(false); setCreateName(""); setCreateDescription(""); } }} />
      <ConfirmActionModal
        isOpen={Boolean(confirmState)}
        title={
          confirmState?.type === "deleteMoodboard"
            ? "Supprimer ce moodboard ?"
            : "Supprimer cette image ?"
        }
        description={
          confirmState?.type === "deleteMoodboard"
            ? `Le moodboard \"${confirmState.moodboardName}\" et toutes ses images seront supprimés définitivement.`
            : "Cette image sera retirée du moodboard."
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        intent="danger"
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={() => {
          if (!confirmLoading) {
            setConfirmState(null);
          }
        }}
      />
    </div>
  );
}
