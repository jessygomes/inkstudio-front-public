"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

interface LogoutBtnProps {
  children?: React.ReactNode;
  className?: string;
  onDone?: () => void;
}

export const LogoutBtn = ({ children, className, onDone }: LogoutBtnProps) => {
  const router = useRouter();

  const onClick = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Déconnexion réussie");
      onDone?.();
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={className ?? "flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 font-one text-xs transition-colors hover:bg-white/6"}
    >
      <LogOut size={15} aria-hidden="true" className="shrink-0" />
      {children}
    </button>
  );
};
