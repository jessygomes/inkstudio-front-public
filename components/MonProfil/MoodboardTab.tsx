"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
  FaImages,
  FaPlus,
} from "react-icons/fa";
import AppButton from "../Shared/AppButton";
import ConfirmActionModal from "../Shared/ConfirmActionModal";
import { extractUploadThingKey } from "@/lib/utils/extractUploadThingKey";
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
  const [selectedMoodboardId, setSelectedMoodboardId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

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
      toast.success("Moodboard créé");
    } catch (error) {
      console.error("Erreur création moodboard:", error);
      toast.error("Erreur lors de la création du moodboard");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveInfos = async () => {
    if (!selectedMoodboard) return;

    if (!editName.trim()) {
      toast.error("Le nom du moodboard est obligatoire");
      return;
    }

    try {
      setSavingInfos(true);
      const result = await updateMoodboardAction(selectedMoodboard.id, {
        name: editName.trim(),
        description: editDescription.trim() || "",
      });

      if (!result.ok || !result.data) {
        toast.error(result.message || "Impossible de modifier le moodboard");
        return;
      }

      setMoodboards((prev) =>
        prev.map((moodboard) =>
          moodboard.id === selectedMoodboard.id
            ? { ...moodboard, ...result.data }
            : moodboard,
        ),
      );
      toast.success("Informations du moodboard mises à jour");
    } catch (error) {
      console.error("Erreur update moodboard:", error);
      toast.error("Erreur lors de la modification");
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
      {selectedMoodboard ? (
        <MoodboardSelectedPanel
          selectedMoodboard={selectedMoodboard}
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
        <div className="rounded-3xl border border-white/10 bg-linear-to-br from-noir-700/6 to-noir-700 p-4 shadow-xl backdrop-blur-lg sm:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-one text-lg font-semibold text-white sm:text-xl">
                Mes moodboards
              </h3>
              <p className="text-xs text-white/60 font-one">
                {moodboards.length} moodboard{moodboards.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-tertiary-500/25 bg-tertiary-500/15">
              <FaImages className="h-4 w-4 text-tertiary-400" />
            </div>
          </div>

          <form
            onSubmit={handleCreateMoodboard}
            className="mb-6 grid grid-cols-1 gap-2 border-b border-white/10 pb-5 lg:grid-cols-[1fr_1fr_auto] font-one"
          >
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Nom du moodboard"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1 text-sm text-white outline-none placeholder:text-white/35 focus:border-tertiary-400/40"
            />
            <input
              type="text"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Description (optionnelle)"
              className="rounded-2xl border border-white/15 bg-white/5 px-3 py-1 text-sm text-white outline-none placeholder:text-white/35 focus:border-tertiary-400/40"
            />
            <AppButton
              disabled={creating}
              icon={<FaPlus className="h-2 w-2" />}
              className="text-xs cursor-pointer"
            >
              {creating ? "Création..." : "Créer"}
            </AppButton>
          </form>

          {moodboards.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 py-10 text-center">
              <p className="font-one text-sm text-white/65">
                Aucun moodboard pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {moodboards.map((moodboard) => (
                <MoodboardCard
                  key={moodboard.id}
                  moodboard={moodboard}
                  isActive={selectedMoodboardId === moodboard.id}
                  isDeleting={deletingMoodboardId === moodboard.id}
                  onOpen={openMoodboard}
                  onDelete={handleDeleteMoodboard}
                />
              ))}
            </div>
          )}
        </div>
      )}

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
