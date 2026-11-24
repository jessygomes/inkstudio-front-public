"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Globe, Smartphone } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

// Sur téléphone, propose d'ouvrir la page dans l'app Inkera People (même chemin : /<slug>/rdv/<jeton>, /invitation/<jeton>…),
// de la télécharger, ou de continuer sur le site. Affiché une fois par session de navigation.
// Le chemin peut contenir un jeton : il n'est jamais stocké ni journalisé (seul l'état « fermé » est mémorisé).

const SCHEME = "inkera-people";
const ANDROID_PACKAGE = "com.inkera.people";
// Store : adresses configurables. Play Store déduit du nom du paquet (valide une fois l'app publiée) ; App Store : identifiant à renseigner.
const ANDROID_STORE_URL = process.env.NEXT_PUBLIC_PEOPLE_ANDROID_STORE_URL || `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
const IOS_STORE_URL = process.env.NEXT_PUBLIC_PEOPLE_IOS_STORE_URL || "";
const DISMISSED_KEY = "inkera_open_in_app_dismissed";

type Platform = "android" | "ios";

function detectPlatform(): Platform | null {
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return "android";
  // iPadOS se présente comme un Mac : on le reconnaît à l'écran tactile.
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  return null;
}

export default function OpenInAppPrompt({ appPath, title, text }: { appPath: string; title: string; text: string }) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [open, setOpen] = useState(false);
  const [notInstalled, setNotInstalled] = useState(false);

  useEffect(() => {
    const detected = detectPlatform();
    let dismissed = false;
    try { dismissed = window.sessionStorage.getItem(DISMISSED_KEY) === "1"; } catch { /* stockage indisponible */ }
    if (!detected || dismissed) return;
    // Rendu côté navigateur uniquement (le serveur ne connaît pas l'appareil) : affichage différé d'un tour.
    const id = window.setTimeout(() => { setPlatform(detected); setOpen(true); }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  if (!open || !platform) return null;

  const path = appPath.replace(/^\/+/, "");
  const storeUrl = platform === "android" ? ANDROID_STORE_URL : IOS_STORE_URL;

  const close = () => {
    try { window.sessionStorage.setItem(DISMISSED_KEY, "1"); } catch { /* stockage indisponible */ }
    setOpen(false);
  };

  const openApp = () => {
    try { window.sessionStorage.setItem(DISMISSED_KEY, "1"); } catch { /* stockage indisponible */ }
    if (platform === "android") {
      // Lien d'intention : ouvre l'app si elle est installée, sinon le Play Store.
      window.location.href = `intent://${path}#Intent;scheme=${SCHEME};package=${ANDROID_PACKAGE};S.browser_fallback_url=${encodeURIComponent(ANDROID_STORE_URL)};end`;
      return;
    }
    // iOS : si l'app n'est pas installée, la page reste affichée ; on propose alors de la télécharger.
    const started = Date.now();
    // Lien vers l'app (schéma inkera-people://), pas une page du site.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `${SCHEME}://${path}`;
    window.setTimeout(() => {
      if (!document.hidden && Date.now() - started < 4000) setNotInstalled(true);
    }, 1600);
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="open-in-app-title" className="fixed inset-0 z-100 flex items-end bg-black/60 backdrop-blur-sm font-one" onClick={close}>
      <div className="w-full rounded-t-3xl bg-noir-500 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-noir-800">
            <Image src="/images/Logo22.png" alt="" width={40} height={40} className="object-contain" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-tertiary-400">Application Inkera People</p>
            <h2 id="open-in-app-title" className="mt-1 text-lg font-semibold leading-tight text-white">{title}</h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/60">{notInstalled ? "L’app ne semble pas installée sur ce téléphone. Téléchargez-la, ou continuez sur le site." : text}</p>
        <div className="mt-5 grid gap-2.5">
          {!notInstalled && (
            <AppButton type="button" onClick={openApp} fullWidth icon={<Smartphone size={16} aria-hidden="true" />} className="min-h-12 px-4!">Ouvrir dans l’app</AppButton>
          )}
          {storeUrl && (
            <AppButton href={storeUrl} variant={notInstalled ? "primary" : "secondary"} fullWidth icon={<Download size={16} aria-hidden="true" />} className={notInstalled ? "min-h-12 px-4!" : "min-h-12 border-0! bg-white/6! px-4! hover:bg-white/10!"}>Télécharger l’app</AppButton>
          )}
          <button type="button" onClick={close} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm text-white/60 transition hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400">
            <Globe size={15} aria-hidden="true" />Continuer sur le site
          </button>
        </div>
      </div>
    </div>
  );
}
