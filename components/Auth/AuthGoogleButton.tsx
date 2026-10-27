import { FaGoogle } from "react-icons/fa";
import { LoaderCircle } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

export default function AuthGoogleButton({ onClick, pending, disabled }: { onClick: () => void; pending: boolean; disabled: boolean }) {
  return <AppButton type="button" variant="secondary" fullWidth onClick={onClick} disabled={disabled} aria-busy={pending} icon={pending ? <LoaderCircle size={16} aria-hidden="true" className="animate-spin" /> : <FaGoogle size={15} aria-hidden="true" />} className="min-h-11 px-4! shadow-none!">{pending ? "Connexion avec Google…" : "Continuer avec Google"}</AppButton>;
}
