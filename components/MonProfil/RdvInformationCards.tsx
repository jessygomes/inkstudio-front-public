"use client";
import type { ReactNode } from "react";
import Image from "next/image";
import { toHourLabel } from "@/lib/utils/date";
import { CalendarDays, Clock3, CreditCard, FileText, UserRound } from "lucide-react";
import { formatDesiredTattooPeriod, formatIsFirstTattoo, formatProjectBudget, type ProjectClientInfo } from "@/lib/booking-link";
const openImageInNewTab = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
const formatSkinTone = (skin: string) => skin;
const getSkinTonePreviewHex = (skin: string) => /^#[0-9a-f]{6}$/i.test(skin) ? skin : undefined;
type AppointmentInformation = {
    id: string;
    start: string | Date;
    end: string | Date;
    prestation?: string;
    skin?: string | null;
    tatoueur?: {
        name: string;
    } | null;
    tattooDetail?: {
        description?: string | null;
        zone?: string | null;
        size?: string | number | null;
        colorStyle?: string | null;
        price?: number | null;
        estimatedPrice?: number | null;
        reference?: string | null;
        sketch?: string | null;
        piercingZone?: string | null;
    } | null;
    description?: string;
    zone?: string;
    size?: string | number;
    estimatedPrice?: number;
    performerUser?: {
        firstName?: string;
        lastName?: string;
        salonName?: string;
    } | null;
} & ProjectClientInfo;
const panel = "rounded-2xl bg-white/4 p-4 font-one";
const serviceNames: Record<string, string> = { TATTOO: "Tatouage", PROJET: "Projet", RETOUCHE: "Retouche", PIERCING: "Piercing" };
export function RdvPlanningCard({ appointment }: {
    appointment: AppointmentInformation;
}) {
    const start = new Date(appointment.start);
    const end = new Date(appointment.end);
    const time = (date: Date) => toHourLabel(date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const artist = appointment.performerUser?.salonName || [appointment.performerUser?.firstName, appointment.performerUser?.lastName].filter(Boolean).join(" ") || appointment.tatoueur?.name;
    return <section aria-label="Planning du rendez-vous" className={panel}>
    <div className="mb-4 flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-xs font-semibold text-white/85"><CalendarDays size={14} className="text-white/35"/>Date & horaire</h3><span className="shrink-0 rounded-xl bg-tertiary-400/10 px-2 py-1 text-[10px] font-medium text-tertiary-400">{serviceNames[appointment.prestation || ""] || appointment.prestation}</span></div>
    <div className="flex items-center gap-3"><div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white/5"><span className="text-lg font-semibold leading-none text-white/85">{start.toLocaleDateString("fr-FR", { day: "2-digit" })}</span><span className="mt-1 text-[9px] uppercase text-white/35">{start.toLocaleDateString("fr-FR", { month: "short" })}</span></div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-white/80">{start.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p><p className="mt-1.5 text-sm font-medium tabular-nums text-white">{time(start)}<span className="mx-1.5 text-white/25">–</span>{time(end)}</p></div></div>
    <dl className="mt-4 divide-y divide-white/[0.06]"><div className="flex items-center justify-between gap-3 py-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-white/35"><Clock3 size={12}/>Durée</dt><dd className="text-xs text-white/70">{minutes >= 60 ? Math.floor(minutes / 60) + " h" + (minutes % 60 ? " " + minutes % 60 : "") : minutes + " min"}</dd></div><div className="flex items-center justify-between gap-3 pt-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-white/35"><UserRound size={12}/>Artiste</dt><dd className="min-w-0 truncate text-xs text-white/70">{artist || "Non assigné"}</dd></div></dl>
  </section>;
}
export function RdvPrestationCard({ appointment, price, piercingZoneName, children }: {
    appointment: AppointmentInformation;
    price?: number;
    piercingZoneName?: string | null;
    children?: ReactNode;
}) {
    const detail = appointment.tattooDetail;
    const rawDescription = detail?.description || appointment.description;
    // Flash : son nom est noté dans la description, son image est envoyée comme référence à la réservation.
    const isFlash = appointment.prestation === "TATTOO";
    const flashName = isFlash ? /Flash sélectionné\s*:\s*(.+)/.exec(rawDescription || "")?.[1]?.trim() || null : null;
    const flashImage = isFlash ? detail?.reference || null : null;
    const description = flashName ? rawDescription?.replace(/\s*Flash sélectionné\s*:.+/, "").trim() : rawDescription;
    const displayPrice = price ?? detail?.price ?? detail?.estimatedPrice ?? appointment.estimatedPrice;
    const facts = [
        { label: "Zone", value: detail?.zone || appointment.zone },
        { label: "Dimensions", value: detail?.size || appointment.size },
        { label: "Style / Couleur", value: detail?.colorStyle },
        { label: "Carnation", value: appointment.skin ? formatSkinTone(appointment.skin) : undefined },
        { label: "Zone de piercing", value: detail?.piercingZone },
        { label: "Type de piercing", value: piercingZoneName },
    ].filter((item) => item.value);
    // Informations indicatives d'une demande Projet (dates affichées sans conversion de fuseau).
    const projectFacts = appointment.prestation === "PROJET" ? [
        { label: "Période souhaitée", value: formatDesiredTattooPeriod(appointment) },
        { label: "Budget", value: formatProjectBudget(appointment.projectBudgetMinCents, appointment.projectBudgetMaxCents) },
        { label: "Premier tatouage", value: formatIsFirstTattoo(appointment.isFirstTattoo) },
    ].filter((item) => item.value) : [];
    return <section aria-label="Détails de la prestation" className={panel}>
    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold text-white/85"><FileText size={14} className="text-white/35"/>La prestation</h3>
    {(flashImage || flashName) && <div className="mb-4 flex items-center gap-4 rounded-xl bg-white/5 p-3">
      {flashImage && <button type="button" aria-label="Voir le flash en grand" onClick={() => openImageInNewTab(flashImage)} className="relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><Image src={flashImage} alt={flashName ? "Flash " + flashName : "Flash choisi"} fill sizes="96px" unoptimized className="object-cover"/></button>}
      <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.12em] text-tertiary-400">Le flash choisi</p>{flashName && <p className="mt-1 break-words text-sm font-medium text-white/90">{flashName}</p>}</div>
    </div>}
    {description && <p className="mb-4 whitespace-pre-wrap break-words text-xs leading-6 text-white/65">{description}</p>}
    {facts.length > 0 && <dl className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3">{facts.map((fact) => <div key={fact.label} className="min-w-0"><dt className="text-[10px] text-white/35">{fact.label}</dt><dd className="mt-1 flex items-center gap-1.5 break-words text-xs text-white/75">{fact.label === "Carnation" && <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: getSkinTonePreviewHex(appointment.skin || "") || undefined }}/>}{fact.value}</dd></div>)}</dl>}
    {projectFacts.length > 0 && <dl aria-label="Votre projet" className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-white/5 p-3">{projectFacts.map((fact) => <div key={fact.label} className={"min-w-0" + (fact.label === "Période souhaitée" ? " col-span-2" : "")}><dt className="text-[10px] text-white/35">{fact.label}</dt><dd className="mt-1 break-words text-xs text-white/75">{fact.value}</dd></div>)}</dl>}
    {typeof displayPrice === "number" && displayPrice > 0 && <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5"><span className="text-[11px] text-white/40">{detail?.price ? "Prix de la prestation" : "Tarif estimé"}</span><span className="text-base font-semibold tabular-nums text-white/90">{displayPrice.toLocaleString("fr-FR")}<span className="ml-1 text-xs font-normal text-white/40">€</span></span></div>}
    {((detail?.reference && !flashImage) || detail?.sketch) && <div className="mb-4"><p className="mb-2 text-[10px] text-white/35">Références du projet</p><div className="grid grid-cols-2 gap-2">{[{ url: flashImage ? undefined : detail?.reference, label: "Référence" }, { url: detail?.sketch, label: "Croquis" }].map((item) => item.url ? <button type="button" key={item.label} aria-label={"Voir le visuel : " + item.label} onClick={() => openImageInNewTab(item.url!)} className="relative h-24 cursor-pointer overflow-hidden rounded-xl bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary-400"><Image src={item.url} alt={item.label} fill sizes="200px" unoptimized className="object-cover"/><span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[10px] text-white">{item.label}</span></button> : null)}</div></div>}
    {children && <div className="mt-4 pt-3">{children}</div>}
  </section>;
}
export function RdvPaymentCard({ appointment }: {
    appointment: {
        prestation?: string;
        isPayed?: boolean;
    };
}) {
    if (!["TATTOO", "RETOUCHE", "PIERCING"].includes(appointment.prestation || ""))
        return null;
    return <section aria-label="Règlement" className={panel}><div className="flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 text-xs font-semibold text-white/85"><CreditCard size={14} className="text-white/35"/>Paiement</h3><span className={"rounded-xl px-2 py-1 text-[10px] " + (appointment.isPayed ? "bg-emerald-400/5 text-emerald-400" : "bg-white/5 text-white/50")}>{appointment.isPayed ? "Réglé" : "En attente"}</span></div><p className="mt-3 text-xs leading-5 text-white/45">{appointment.isPayed ? "Le règlement de cette prestation est enregistré." : "Le règlement de cette prestation reste à effectuer."}</p></section>;
}
