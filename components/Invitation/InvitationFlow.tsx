"use client";

import { useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { ArrowUpRight, CalendarCheck, CheckCircle2, LogIn, ShieldCheck, Store } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";
import AuthFeedback from "@/components/Auth/AuthFeedback";
import Register from "@/components/Auth/Register";
import { iconBadge } from "@/components/Shared/ui";
import { setAuthReturnPath } from "@/lib/booking-link";
import { acceptClientInvitation, type ClientInvitationInfo } from "@/lib/actions/clientInvitation.action";

export type InvitationViewer =
  | { state: "anonymous" }
  | { state: "expired" }
  | { state: "authenticated"; role: string; email: string; firstName: string };

type Props = {
  token: string;
  info: ClientInvitationInfo | null;
  errorCode?: string;
  viewer: InvitationViewer;
};

const ERRORS: Record<string, string> = {
  INVITATION_NOT_FOUND: "Ce lien d’invitation n’existe pas. Vérifiez qu’il est complet, ou demandez-en un nouveau à votre salon.",
  INVITATION_EXPIRED: "Ce lien d’invitation a expiré. Demandez-en un nouveau à votre salon.",
  INVITATION_REVOKED: "Ce lien n’est plus valable. Si vous avez déjà accepté une autre invitation de ce salon, vos rendez-vous sont dans votre espace ; sinon, demandez un nouveau lien à votre salon.",
  INVITATION_USED: "Ce lien a déjà été utilisé.",
  EMAIL_MISMATCH: "Ce compte n’utilise pas l’adresse e-mail à laquelle l’invitation a été envoyée.",
  EMAIL_NOT_VERIFIED: "Confirmez d’abord votre adresse e-mail avec le lien reçu à l’inscription, puis revenez sur cette page.",
  CLIENT_ALREADY_LINKED: "Vos rendez-vous chez ce salon sont déjà rattachés à un autre compte Inkera. Contactez votre salon.",
  ACCOUNT_ALREADY_LINKED: "Votre compte est déjà rattaché à ce salon : vos rendez-vous sont déjà dans votre espace.",
  CLIENT_ACCOUNT_REQUIRED: "Cette invitation est destinée à un compte client Inkera.",
  RATE_LIMIT_EXCEEDED: "Trop de tentatives. Merci de réessayer dans quelques minutes.",
};

const STATUS_CODES: Record<string, string> = { EXPIRED: "INVITATION_EXPIRED", REVOKED: "INVITATION_REVOKED", ACCEPTED: "INVITATION_USED" };

function SalonBadge({ info }: { info: ClientInvitationInfo }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/4 p-3">
      {info.salonImage
        ? <Image src={info.salonImage} alt="" width={44} height={44} unoptimized className="size-11 shrink-0 rounded-xl object-cover" />
        : <span aria-hidden="true" className={iconBadge}><Store size={18} /></span>}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{info.salonName}</p>
        <p className="text-xs text-white/55">vous invite à rejoindre Inkera</p>
      </div>
    </div>
  );
}

export default function InvitationFlow({ token, info, errorCode, viewer }: Props) {
  const path = `/invitation/${encodeURIComponent(token)}`;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [linkedSalon, setLinkedSalon] = useState<string | null>(null);

  const goToLogin = () => {
    setAuthReturnPath(path);
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/se-connecter");
  };

  const terminal = errorCode ?? (info && info.status !== "ACTIVE" ? STATUS_CODES[info.status] : undefined);
  if (!info || terminal) {
    const code = terminal ?? "INVITATION_NOT_FOUND";
    return (
      <div className="font-one">
        {info && <SalonBadge info={info} />}
        <h1 className="font-two text-3xl font-medium tracking-tight text-white">Invitation indisponible</h1>
        <p className="mt-3 text-sm leading-7 text-white/60">{ERRORS[code] ?? "Impossible d’ouvrir cette invitation pour le moment. Réessayez plus tard."}</p>
        {code === "INVITATION_USED" && <p className="mt-2 text-sm leading-7 text-white/60">Si c’est vous, vos rendez-vous vous attendent dans votre espace client.</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <AppButton href={viewer.state === "authenticated" ? "/mon-profil" : "/se-connecter"} icon={<ArrowUpRight size={15} aria-hidden="true" />} className="min-h-11! rounded-xl! px-5!">{viewer.state === "authenticated" ? "Mon espace client" : "Me connecter"}</AppButton>
          <AppButton href="/" variant="secondary" className="min-h-11! rounded-xl! border-0! bg-white/6! px-5! hover:bg-white/10!">Découvrir Inkera</AppButton>
        </div>
      </div>
    );
  }

  if (linkedSalon) {
    return (
      <div className="font-one">
        <span aria-hidden="true" className={iconBadge}><CheckCircle2 size={18} /></span>
        <h1 className="mt-5 font-two text-3xl font-medium tracking-tight text-white">C’est fait !</h1>
        <p className="mt-3 text-sm leading-7 text-white/60">Vos rendez-vous avec {linkedSalon}, vos échanges avec le salon et votre suivi vous attendent dans votre espace client.</p>
        <AppButton href="/mon-profil" fullWidth icon={<ArrowUpRight size={16} aria-hidden="true" />} className="mt-6 min-h-11 px-4!">Ouvrir mon espace client</AppButton>
      </div>
    );
  }

  if (viewer.state === "anonymous") {
    return (
      <div className="font-one">
        <SalonBadge info={info} />
        <Register invitation={{ token, salonName: info.salonName, email: info.email ?? "", firstName: info.firstName, lastName: info.lastName }} />
      </div>
    );
  }

  if (viewer.state === "expired") {
    return (
      <div className="font-one">
        <SalonBadge info={info} />
        <h1 className="font-two text-3xl font-medium tracking-tight text-white">Reconnectez-vous</h1>
        <p className="mt-3 text-sm leading-7 text-white/60">Votre session a expiré. Reconnectez-vous pour retrouver vos rendez-vous avec {info.salonName}.</p>
        <AppButton type="button" onClick={goToLogin} fullWidth icon={<LogIn size={16} aria-hidden="true" />} className="mt-6 min-h-11 px-4!">Me reconnecter</AppButton>
      </div>
    );
  }

  if (viewer.role !== "client") {
    return (
      <div className="font-one">
        <SalonBadge info={info} />
        <h1 className="font-two text-3xl font-medium tracking-tight text-white">Invitation client</h1>
        <p className="mt-3 text-sm leading-7 text-white/60">{ERRORS.CLIENT_ACCOUNT_REQUIRED} Vous êtes connecté avec un compte professionnel.</p>
        <AppButton type="button" variant="secondary" onClick={() => void signOut({ callbackUrl: path })} fullWidth className="mt-6 min-h-11 border-0! bg-white/6! px-4! hover:bg-white/10!">Me déconnecter</AppButton>
      </div>
    );
  }

  const sameEmail = !!info.email && viewer.email.trim().toLowerCase() === info.email.trim().toLowerCase();
  if (!sameEmail) {
    return (
      <div className="font-one">
        <SalonBadge info={info} />
        <h1 className="font-two text-3xl font-medium tracking-tight text-white">Une autre adresse e-mail</h1>
        <p className="mt-3 text-sm leading-7 text-white/60">Vous êtes connecté avec <span className="text-white/85">{viewer.email}</span>, mais {info.salonName} vous a invité à l’adresse <span className="text-white/85">{info.email}</span>.</p>
        <p className="mt-2 text-sm leading-7 text-white/60">Pour retrouver vos rendez-vous avec ce salon, connectez-vous avec cette adresse, ou créez un compte avec elle.</p>
        <AppButton type="button" onClick={() => void signOut({ callbackUrl: path })} fullWidth icon={<LogIn size={16} aria-hidden="true" />} className="mt-6 min-h-11 px-4!">Changer de compte</AppButton>
      </div>
    );
  }

  const accept = async () => {
    setPending(true);
    setError("");
    const result = await acceptClientInvitation(token);
    setPending(false);
    if (result.ok) { setLinkedSalon(result.data.salonName); return; }
    if (result.code === "SESSION_EXPIRED" || result.code === "LOGIN_REQUIRED" || result.status === 401) { goToLogin(); return; }
    setError((result.code && ERRORS[result.code]) || result.message || "Impossible d’accepter l’invitation pour le moment. Réessayez plus tard.");
  };

  return (
    <div className="font-one">
      <SalonBadge info={info} />
      <p className="text-[10px] uppercase tracking-[0.18em] text-tertiary-400">Bonjour {viewer.firstName || info.firstName}</p>
      <h1 className="mt-3 font-two text-3xl font-medium tracking-tight text-white">Retrouvez vos rendez-vous avec {info.salonName}</h1>
      <p className="mt-3 text-sm leading-7 text-white/60">En acceptant, vous retrouvez dans votre espace Inkera :</p>
      <ul className="mt-3 space-y-2.5">
        {[
          `Les rendez-vous pris pour vous par ${info.salonName}, dans « Mes rendez-vous », avec leurs rappels. Vous pouvez les suivre, les déplacer ou les annuler.`,
          "Vos échanges avec votre tatoueur dans la messagerie Inkera.",
          "Les dessins à valider et les conseils de cicatrisation que le salon vous envoie.",
        ].map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-6 text-white/75"><CheckCircle2 size={16} aria-hidden="true" className="mt-1 shrink-0 text-tertiary-400" />{item}</li>
        ))}
      </ul>
      <p className="mt-4 flex gap-2.5 rounded-2xl bg-white/4 p-3 text-xs leading-6 text-white/55"><ShieldCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-white/45" />Le salon ne voit ni vos favoris, ni vos moodboards privés, ni vos rendez-vous dans d’autres salons.</p>
      {error && <div className="mt-5"><AuthFeedback error={error} success="" /></div>}
      <AppButton type="button" onClick={() => void accept()} disabled={pending} fullWidth icon={<CalendarCheck size={16} aria-hidden="true" />} className="mt-6 min-h-11 px-4!">{pending ? "Un instant…" : "Accepter l’invitation"}</AppButton>
      <p className="mt-3 text-center text-[11px] leading-5 text-white/40">Connecté avec {viewer.email}</p>
    </div>
  );
}
