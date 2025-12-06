"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/components/Context/UserContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaIdCard,
  FaArrowLeft,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { updateProfileSchema } from "@/lib/zod/validator-schema";
import {
  updateUserInfoAction,
  getClientProfile,
} from "@/lib/actions/user.action";
import SalonImageUploader from "@/components/Shared/ImageProfileUpload";

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

export default function ModifierProfilPage() {
  const { isAuthenticated, isClient } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // État pour les données complètes du profil
  const [profileData, setProfileData] = useState<ClientProfileData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Récupération des données complètes du profil
  useEffect(() => {
    if (!isAuthenticated || !isClient) return;

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
  }, [isAuthenticated, isClient, reset]);

  // Redirection si pas authentifié ou pas client
  if (!isAuthenticated || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-500 to-noir-700 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 font-one mb-4">
            Vous devez être connecté en tant que client pour accéder à cette
            page.
          </p>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-500 to-noir-700 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tertiary-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/60 font-one">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-500 to-noir-700 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 font-one mb-4">
            Erreur lors du chargement des données
          </p>
          <Link
            href="/mon-profil"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105"
          >
            Retour au profil
          </Link>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-noir-700 via-noir-500 to-noir-700 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/mon-profil"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.06] text-white border border-white/20 hover:border-white/30 rounded-xl transition-all duration-300 font-one text-sm"
          >
            <FaArrowLeft className="w-4 h-4" />
            Retour au profil
          </Link>
          <h1 className="text-2xl sm:text-3xl font-one font-bold text-white">
            Modifier mon profil
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Informations personnelles */}
          <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <FaUser className="w-5 h-5 text-tertiary-400" />
              <h2 className="text-white font-one font-semibold text-lg">
                Informations personnelles
              </h2>
            </div>

            <div className="bg-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-4 border border-white/10 mb-4">
              <h3 className="text-base sm:text-sm font-semibold text-tertiary-400 mb-4 sm:mb-3 font-one uppercase tracking-wide">
                <span className="hidden sm:inline">📸 Photo de profil</span>
                <span className="sm:hidden">📸 Photo</span>
              </h3>
              <SalonImageUploader
                currentImage={watch("image") || profileData?.image || undefined}
                onImageUpload={(imageUrl) => setValue("image", imageUrl)}
                onImageRemove={() => setValue("image", "")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Prénom */}
              <div>
                <label className="text-white/70 font-one text-sm mb-2 block">
                  Prénom *
                </label>
                <input
                  type="text"
                  {...register("firstName")}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300"
                  placeholder="Votre prénom"
                />
                {errors.firstName && (
                  <p className="text-red-300 text-xs mt-1 font-one">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="text-white/70 font-one text-sm mb-2 block">
                  Nom *
                </label>
                <input
                  type="text"
                  {...register("lastName")}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300"
                  placeholder="Votre nom"
                />
                {errors.lastName && (
                  <p className="text-red-300 text-xs mt-1 font-one">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-white/70 font-one text-sm mb-2 flex items-center gap-2">
                  <FaEnvelope className="w-3 h-3" />
                  Email *
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300"
                  placeholder="votre.email@exemple.com"
                />
                {errors.email && (
                  <p className="text-red-300 text-xs mt-1 font-one">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="text-white/70 font-one text-sm mb-2 flex items-center gap-2">
                  <FaPhone className="w-3 h-3" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300"
                  placeholder="06 12 34 56 78"
                />
              </div>

              {/* Date de naissance */}
              <div className="sm:col-span-2">
                <label className="text-white/70 font-one text-sm mb-2 flex items-center gap-2">
                  <FaBirthdayCake className="w-3 h-3" />
                  Date de naissance
                </label>
                <input
                  type="date"
                  {...register("birthDate")}
                  className="w-full max-w-xs p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <FaIdCard className="w-5 h-5 text-tertiary-400" />
              <h2 className="text-white font-one font-semibold text-lg">
                Informations complémentaires
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Pseudo */}
              <div>
                <label className="text-white/70 font-one text-sm mb-2 block">
                  Pseudo / Surnom
                </label>
                <input
                  type="text"
                  {...register("pseudo")}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300"
                  placeholder="Votre pseudo"
                />
                <p className="text-white/50 text-xs mt-1 font-one">
                  Optionnel - Sera affiché publiquement si renseigné
                </p>
              </div>

              {/* Ville */}
              <div>
                <label className="text-white/70 font-one text-sm mb-2 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  Ville
                </label>
                <input
                  type="text"
                  {...register("city")}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300"
                  placeholder="Votre ville"
                />
              </div>

              {/* Code postal */}
              <div className="sm:col-span-2">
                <label className="text-white/70 font-one text-sm mb-2 block">
                  Code postal
                </label>
                <input
                  type="text"
                  {...register("postalCode")}
                  className="w-full max-w-xs p-3 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-tertiary-400 focus:ring-2 focus:ring-tertiary-400/20 transition-all duration-300"
                  placeholder="75001"
                  maxLength={5}
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href="/mon-profil"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 rounded-xl transition-all duration-300 font-one text-sm"
            >
              <FaTimes className="w-4 h-4" />
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl transition-all duration-300 font-one text-sm shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
