"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AppButton from "@/components/Shared/AppButton";
import ProfileEditorForm from "./ProfileEditorForm";
import { updateProfileSchema } from "@/lib/zod/validator-schema";
import {
  updateUserInfoAction,
  getClientProfile,
} from "@/lib/actions/user.action";
import { User } from "@/lib/type";

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

type ClientProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  image?: string | null;
  clientProfile?: {
    pseudo?: string | null;
    city?: string | null;
    postalCode?: string | null;
    birthDate?: string | null;
  } | null;
};

export default function UpdateProfil(user: User) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État pour les données complètes du profil
  const [profileData, setProfileData] = useState<ClientProfileData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
  });
  const { reset, watch } = form;

  // Récupération des données complètes du profil
  useEffect(() => {
    if (!user.id) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const result = await getClientProfile();

        if (result.ok) {
          setProfileData(result.data);

          // Pré-remplir le formulaire avec les données récupérées
          reset({
            firstName: result.data.firstName || "",
            lastName: result.data.lastName || "",
            email: result.data.email || "",
            phone: result.data.phone || "",
            pseudo: result.data.clientProfile?.pseudo || "",
            city: result.data.clientProfile?.city || "",
            postalCode: result.data.clientProfile?.postalCode || "",
            birthDate: result.data.clientProfile?.birthDate
              ? new Date(result.data.clientProfile.birthDate)
                  .toISOString()
                  .split("T")[0]
              : "",
            image: result.data.image || "",
          });
        } else {
          console.error("Erreur récupération profil:", result.message);
          toast.error("Erreur lors du chargement des données");
        }
      } catch (error) {
        console.error("Erreur fetch profil:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user.id, reset]);

  // Loading state
  if (loading) {
    return (
      <div role="status" className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60 font-one">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div role="alert" className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-12">
        <div className="text-center">
          <p className="text-white/60 font-one mb-4">
            Erreur lors du chargement des données
          </p>
          <AppButton
            href="/mon-profil"
            className="min-h-11 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-400"
          >
            Retour au profil
          </AppButton>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: UpdateProfileForm) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, image: watch("image") || "" };
      const result = await updateUserInfoAction(payload);

      if (result.ok) {
        toast.success("Profil mis à jour avec succès !");
        router.push("/mon-profil"); // Les nouvelles données seront récupérées automatiquement
      } else {
        toast.error(result.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <ProfileEditorForm form={form} onSubmit={onSubmit} isSubmitting={isSubmitting} onCancel={() => router.push("/mon-profil")} />;
}
