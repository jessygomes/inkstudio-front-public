"use client";

import React, { useState, useTransition } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "sonner";
import { toggleFavoriteSalon } from "@/lib/actions/user.action";
import { useUser } from "@/components/Context/UserContext";

type Props = {
  salonId: string;
  isFavorite?: boolean;
  variant?: "default" | "compact" | "icon-only";
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
};

export default function FavoriteBtn({
  salonId,
  isFavorite = false,
  variant = "default",
  className = "",
  onToggle,
}: Props) {
  const { isAuthenticated, isClient } = useUser();
  const [favorite, setFavorite] = useState(isFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour ajouter des favoris");
      return;
    }

    if (!isClient) {
      toast.error("Seuls les clients peuvent ajouter des favoris");
      return;
    }

    startTransition(async () => {
      try {
        const result = await toggleFavoriteSalon(salonId);

        if (result.ok) {
          const newFavoriteState = !favorite;
          setFavorite(newFavoriteState);
          onToggle?.(newFavoriteState);

          toast.success(
            newFavoriteState
              ? "Salon ajouté aux favoris !"
              : "Salon retiré des favoris"
          );
        } else {
          toast.error(result.message || "Erreur lors de la mise à jour");
        }
      } catch (error) {
        console.error("Erreur toggle favorite:", error);
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  // Styles selon la variante
  const getButtonStyles = () => {
    const baseStyles =
      "transition-all duration-300 flex items-center justify-center";

    switch (variant) {
      case "compact":
        return `${baseStyles} px-3 py-2 rounded-lg text-sm font-one ${
          favorite
            ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
            : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 hover:border-white/30"
        } ${className}`;

      case "icon-only":
        return `${baseStyles} w-10 h-10 rounded-full ${
          favorite
            ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
            : "bg-white/10 hover:bg-white/20 text-white/60 hover:text-white border border-white/20 hover:border-white/30"
        } ${className}`;

      default:
        return `${baseStyles} gap-2 px-4 py-2 rounded-xl font-one text-sm ${
          favorite
            ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
            : "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 hover:border-white/30"
        } ${className}`;
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case "compact":
      case "icon-only":
        return "w-4 h-4";
      default:
        return "w-4 h-4";
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending || !isAuthenticated}
      className={`${getButtonStyles()} ${
        isPending ? "opacity-60 cursor-not-allowed" : ""
      } ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
      title={
        !isAuthenticated
          ? "Connectez-vous pour ajouter des favoris"
          : favorite
          ? "Retirer des favoris"
          : "Ajouter aux favoris"
      }
    >
      {isPending ? (
        <div
          className={`animate-spin rounded-full border-2 border-current border-t-transparent ${getIconSize()}`}
        />
      ) : favorite ? (
        <FaHeart className={`${getIconSize()} text-red-400`} />
      ) : (
        <FaRegHeart className={getIconSize()} />
      )}

      {variant === "default" && (
        <span className="hidden sm:inline">
          {favorite ? "Favoris" : "Ajouter"}
        </span>
      )}

      {variant === "compact" && <span>{favorite ? "★" : "☆"}</span>}
    </button>
  );
}
