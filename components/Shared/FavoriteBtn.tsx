"use client";

import React, { useState, useTransition, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "sonner";
import {
  toggleFavoriteSalon,
  isSalonFavorite,
} from "@/lib/actions/user.action";
import { useUser } from "@/components/Context/UserContext";

type Props = {
  salonId: string;
  variant?: "default" | "compact" | "icon-only";
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
};

export default function FavoriteBtn({
  salonId,
  variant = "default",
  className = "",
  onToggle,
}: Props) {
  const { isAuthenticated, isClient } = useUser();
  const [favorite, setFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isChecking, setIsChecking] = useState(true);

  // Vérifier si le salon est déjà en favori au chargement
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated) {
        setIsChecking(false);
        return;
      }

      try {
        const result = await isSalonFavorite(salonId);
        if (result.ok) {
          setFavorite(result.isFavorite);
        }
      } catch (error) {
        console.error("Erreur vérification favori:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkFavoriteStatus();
  }, [salonId, isAuthenticated]);

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

  if (!isAuthenticated) {
    return null;
  }

  if (isChecking) {
    return (
      <button
        disabled
        className={`group w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-300 ${className}`}
      >
        <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
      </button>
    );
  }

  if (variant === "icon-only") {
    return (
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`group w-10 h-10 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
          favorite
            ? "bg-gradient-to-br from-pink-500/30 to-red-500/30 border border-pink-500/50 hover:from-pink-500/40 hover:to-red-500/40"
            : "bg-white/10 border border-white/20 hover:bg-white/20"
        } ${className}`}
        title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {isPending ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : favorite ? (
          <FaHeart className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
        ) : (
          <FaRegHeart className="w-5 h-5 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-one text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
        favorite
          ? "bg-gradient-to-br from-pink-500/30 to-red-500/30 border border-pink-500/50 text-pink-300 hover:from-pink-500/40 hover:to-red-500/40"
          : "bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white"
      } ${className}`}
    >
      {isPending ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {favorite ? (
            <FaHeart className="w-4 h-4 group-hover:scale-110 transition-transform" />
          ) : (
            <FaRegHeart className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
          <span>{favorite ? "Favori" : "Ajouter aux favoris"}</span>
        </>
      )}
    </button>
  );
}
