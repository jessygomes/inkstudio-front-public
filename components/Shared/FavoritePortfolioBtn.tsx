"use client";

import { useState, useTransition } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "sonner";
import { toggleFavoritePortfolio } from "@/lib/actions/user.action";
import { useUser } from "@/components/Context/UserContext";

type FavoritePortfolioBtnProps = {
  portfolioId: string;
  initialFavorite?: boolean;
  variant?: "default" | "icon-only";
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
};

export default function FavoritePortfolioBtn({
  portfolioId,
  initialFavorite = false,
  variant = "icon-only",
  className = "",
  onToggle,
}: FavoritePortfolioBtnProps) {
  const { isAuthenticated, isClient } = useUser();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour ajouter cette image aux favoris");
      return;
    }

    if (!isClient) {
      toast.error("Seuls les clients peuvent ajouter des favoris");
      return;
    }

    startTransition(async () => {
      try {
        const result = await toggleFavoritePortfolio(portfolioId);

        if (!result.ok) {
          toast.error(result.message || "Erreur lors de la mise à jour");
          return;
        }

        const nextFavorite =
          typeof result.isFavorite === "boolean" ? result.isFavorite : !favorite;

        setFavorite(nextFavorite);
        onToggle?.(nextFavorite);

        toast.success(
          nextFavorite
            ? "Image ajoutée aux favoris !"
            : "Image retirée des favoris",
        );
      } catch (error) {
        console.error("Erreur toggle favorite portfolio:", error);
        toast.error("Erreur lors de la mise à jour");
      }
    });
  };

  if (variant === "icon-only") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`group inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
          favorite
            ? "border border-pink-500/50 bg-linear-to-br from-pink-500/30 to-red-500/30 hover:from-pink-500/40 hover:to-red-500/40"
            : "border border-white/20 bg-white/10 hover:bg-white/20"
        } ${className}`}
        title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        {isPending ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : favorite ? (
          <FaHeart className="h-3 w-3 text-pink-400 transition-transform group-hover:scale-110" />
        ) : (
          <FaRegHeart className="h-3 w-3 text-white/80 transition-all group-hover:scale-110 group-hover:text-white" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`group inline-flex cursor-pointer items-center justify-center gap-2 rounded-3xl border px-4 py-2 text-sm font-one transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 text-center ${
        favorite
          ? "border-pink-500/50 bg-linear-to-br from-pink-500/30 to-red-500/30 text-pink-300 hover:from-pink-500/40 hover:to-red-500/40"
          : "border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
      } ${className}`}
    >
      {isPending ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Chargement...</span>
        </>
      ) : (
        <>
          {favorite ? (
            <FaHeart className="h-4 w-4 transition-transform group-hover:scale-110" />
          ) : (
            <FaRegHeart className="h-4 w-4 transition-transform group-hover:scale-110" />
          )}
          <span>{favorite ? "Favori" : "Ajouter aux favoris"}</span>
        </>
      )}
    </button>
  );
}
