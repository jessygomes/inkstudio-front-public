"use client";

import { deleteSession } from "@/lib/session";
// import { logout } from "@/lib/authAction/auth.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AiOutlineLogout } from "react-icons/ai";
import { clearClientSession } from "@/lib/client-session";

interface LogoutBtnProps {
  children?: React.ReactNode;
}

export const LogoutBtn = ({ children }: LogoutBtnProps) => {
  const router = useRouter();

  const onClick = async () => {
    try {
      // ✅ Nettoyer côté serveur
      await deleteSession();

      // ✅ Nettoyer côté client aussi pour être sûr
      clearClientSession();

      toast.success("Déconnexion réussie");
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);

      // ✅ Même en cas d'erreur serveur, nettoyer côté client
      clearClientSession();
      toast.error(
        "Erreur lors de la déconnexion, mais vous avez été déconnecté localement"
      );
      router.push("/");
    }
  };

  return (
    <span
      onClick={onClick}
      className="cursor-pointer w-fit px-3 py-2 text-xs font-one flex items-center gap-1 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.06] hover:bg-noir-500 transition-colors"
    >
      <AiOutlineLogout size={14} className="inline-block" />
      {children}
    </span>
  );
};
