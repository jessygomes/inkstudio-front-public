"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AiOutlineLogout } from "react-icons/ai";

interface LogoutBtnProps {
  children?: React.ReactNode;
}

export const LogoutBtn = ({ children }: LogoutBtnProps) => {
  const router = useRouter();

  const onClick = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Déconnexion réussie");
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
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
