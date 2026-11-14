import { CalendarCheck, Heart, Images, MessageCircle, type LucideIcon } from "lucide-react";

/** Avantages du compte client Inkera People (connexion, inscription, invitation d'un salon, accueil). */
export const CLIENT_BENEFITS: { Icon: LucideIcon; title: string; short: string; description: string }[] = [
  { Icon: CalendarCheck, title: "Vos rendez-vous", short: "Suivez-les et gardez la main.", description: "Retrouvez tous vos rendez-vous et leurs rappels, et gérez-les vous-même." },
  { Icon: MessageCircle, title: "La messagerie Inkera", short: "Échangez avec votre tatoueur.", description: "Parlez directement avec votre tatoueur, photos comprises." },
  { Icon: Images, title: "Vos moodboards", short: "Rassemblez vos inspirations.", description: "Créez vos moodboards et partagez-les avec votre artiste." },
  { Icon: Heart, title: "Vos favoris", short: "Gardez vos coups de cœur.", description: "Retrouvez les artistes, flashs et réalisations qui vous plaisent." },
];
