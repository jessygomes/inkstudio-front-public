"use client";
import { useEffect, useId, useState } from "react";
import { Globe2, LockKeyhole, MapPin, Palette, Save, Share2 } from "lucide-react";
import SideDrawer from "../Shared/SideDrawer";
import { toast } from "sonner";
import { projectRequest } from "@/lib/actions/projects.action";
import AppButton from "../Shared/AppButton";

export type ProjectFields = {
  projectStatus?: string;
  projectCity?: string | null;
  projectCategory?: string | null;
  projectSize?: string | null;
  projectStyles?: string[];
  projectHashtags?: string[];
  projectBodyPlacement?: string | null;
  projectMobility?: string | null;
  projectRadiusKm?: number | null;
};
const inputClass =
  "mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-noir-800/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:bg-white/[0.045] focus:ring-2 focus:ring-tertiary-400/10 [color-scheme:dark] disabled:opacity-50";
const selectClass = `${inputClass} !bg-noir-800 focus:!bg-noir-800 [&_option]:bg-noir-800 [&_option]:text-white`;

export default function ProjectPublication({
  board,
  onUpdated,
}: {
  board: ProjectFields & { id: string; name?: string };
  onUpdated: (fields: ProjectFields) => void;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const [status, setStatus] = useState(board.projectStatus || "PRIVATE");
  const [savedStatus, setSavedStatus] = useState(
    board.projectStatus || "PRIVATE",
  );
  const [busy, setBusy] = useState(false);
  const [mobility, setMobility] = useState(board.projectMobility || "");
  const [options, setOptions] = useState<{
    styles: string[];
  }>({ styles: [] });
  const stylesListId = useId();
  useEffect(() => {
    if (!open) return;
    setStatus(board.projectStatus || "PRIVATE");
    setMobility(board.projectMobility || "");
  }, [open, board.projectStatus, board.projectMobility]);
  useEffect(() => {
    if (!open) return;
    void projectRequest<{ styles: string[] }>("/options")
      .then(setOptions)
      .catch(() => {});
  }, [open]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) || "").trim();
    const tags = (key: string) =>
      text(key)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    setBusy(true);
    try {
      const updated = await projectRequest<ProjectFields>(
        `/moodboards/${board.id}`,
        "PATCH",
        {
          status,
          city: text("city"),
          size: text("size"),
          styles: tags("styles"),
          hashtags: tags("hashtags"),
          bodyPlacement: text("bodyPlacement"),
          mobility,
          ...(mobility === "RADIUS" && { radiusKm: Number(text("radiusKm")) }),
        },
      );
      setSavedStatus(status);
      onUpdated(updated);
      setOpen(false);
      toast.success(
        status === "OPEN"
          ? "Votre projet est visible dans Explorer."
          : "Publication mise à jour.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Enregistrement impossible.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function makePrivate() {
    if (busy) return;
    setBusy(true);
    try {
      const updated = await projectRequest<ProjectFields>(`/moodboards/${board.id}`, "PATCH", { status: "PRIVATE" });
      setSavedStatus("PRIVATE");
      setStatus("PRIVATE");
      onUpdated(updated);
      setOpen(false);
      toast.success("Votre moodboard est privé et retiré d’Explorer.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Impossible de rendre le moodboard privé.");
    } finally { setBusy(false); }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-tertiary-400/10 px-3 text-xs font-medium text-tertiary-400 transition hover:bg-tertiary-400/20 focus-visible:outline-2 focus-visible:outline-tertiary-400"><Share2 size={15} />{savedStatus === "PRIVATE" ? "Partager" : "Gérer le partage"}</button>
      <SideDrawer open={open} title="Partager mon projet" description={board.name} busy={busy} onClose={() => setOpen(false)} headerAction={savedStatus !== "PRIVATE" && <button type="button" disabled={busy} onClick={() => void makePrivate()} className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-2 text-[10px] text-white/60 transition hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400 disabled:opacity-40 sm:px-3 sm:text-xs"><LockKeyhole size={12} />Rendre privé</button>} footer={<>
        <AppButton type="button" variant="secondary" disabled={busy} onClick={() => setOpen(false)} className="min-h-11 flex-1 cursor-pointer !px-4 !text-xs sm:flex-none">Annuler</AppButton>
        <AppButton type="submit" form={formId} disabled={busy} icon={<Save size={14} />} className="min-h-11 flex-1 cursor-pointer !px-4 !text-xs !shadow-none sm:flex-none">{busy ? "Enregistrement…" : "Enregistrer"}</AppButton>
      </>}>
        <div className="mb-7 space-y-2">
          <h3 className="text-sm font-semibold text-white/90">Les tatoueurs viennent à vous</h3>
          <p className="text-xs leading-6 text-white/55">En ouvrant votre projet aux propositions, vous rendez votre moodboard visible aux salons et tatoueurs dans leur page Explorer. Ils découvrent vos images, vos envies et peuvent se proposer pour réaliser votre tatouage.</p>
          <p className="text-xs leading-6 text-white/55">Votre identité reste masquée aux salons et tatoueurs. Elle n’est révélée au professionnel que lorsque vous acceptez sa proposition.</p>
          <p className="text-xs leading-6 text-white/55">Vous recevez leurs propositions ici, consultez leur profil et choisissez avec qui échanger. Acceptez une proposition pour ouvrir la conversation et construire votre projet ensemble.</p>
        </div>
        <form id={formId} onSubmit={submit} aria-busy={busy} className="space-y-7">
          <fieldset disabled={busy} className="min-w-0 border-0 p-0">
            <legend className="sr-only">Visibilité du projet</legend>
            <div className="mb-4 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><Globe2 size={17} /></span><div><p className="text-[10px] uppercase tracking-widest text-white/30">01 · Publication</p><h3 className="mt-1 text-sm font-semibold text-white/85">La visibilité de votre projet</h3><p className="mt-1 text-[11px] leading-5 text-white/40">Vous pouvez retirer votre moodboard d’Explorer à tout moment en le rendant privé.</p></div></div>
          <label className="block min-w-0 text-[11px] font-medium text-white/60">
            Visibilité et statut
            <select
              className={selectClass}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PRIVATE">Privé — retirer d’Explorer</option>
              <option value="OPEN">Ouvert aux propositions</option>
              <option value="MATCHED">Tatoueur trouvé</option>
              <option value="CLOSED">Fermé</option>
            </select>
          </label>
          </fieldset>
          <fieldset disabled={busy} className="min-w-0 border-0 p-0">
            <legend className="sr-only">Détails du tatouage</legend>
            <div className="mb-4 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><Palette size={17} /></span><div><p className="text-[10px] uppercase tracking-widest text-white/30">02 · Vos envies</p><h3 className="mt-1 text-sm font-semibold text-white/85">Précisez votre tatouage</h3><p className="mt-1 text-[11px] leading-5 text-white/40">Ces précisions sont facultatives et peuvent être complétées plus tard.</p></div></div>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="block min-w-0 text-[11px] font-medium text-white/60">
            Ville souhaitée
            <input
              name="city"
              placeholder="Paris, Lyon, Bordeaux…"
              maxLength={120}
              defaultValue={board.projectCity || ""}
              className={inputClass}
            />
          </label>

          <label className="block min-w-0 text-[11px] font-medium text-white/60">
            Taille de la pièce
            <select
              name="size"
              defaultValue={board.projectSize || ""}
              className={selectClass}
            >
              <option value="">Non précisée</option>
              <option value="SMALL">Petite</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="LARGE">Grosse</option>
            </select>
          </label>
          <label className="block min-w-0 text-[11px] font-medium text-white/60">
            Styles (séparés par des virgules)
            <input
              name="styles"
              list={stylesListId}
              defaultValue={board.projectStyles?.join(", ")}
              className={inputClass}
              placeholder="Réalisme, floral…"
            />
          </label>
          <datalist id={stylesListId}>
            {options.styles.map(name => <option key={name} value={name} />)}
          </datalist>
          <label className="block min-w-0 text-[11px] font-medium text-white/60">
            Hashtags (séparés par des virgules)
            <input
              name="hashtags"
              defaultValue={board.projectHashtags?.join(", ")}
              className={inputClass}
              placeholder="#nature, #fleurs…"
            />
          </label>
          <label className="block min-w-0 text-[11px] font-medium text-white/60">
            Emplacement sur le corps
            <input
              name="bodyPlacement"
              maxLength={120}
              defaultValue={board.projectBodyPlacement || ""}
              className={inputClass}
              placeholder="Avant-bras, dos…"
            />
          </label>
            </div>
          </fieldset>
          <fieldset disabled={busy} className="min-w-0 border-0 p-0">
            <legend className="sr-only">Vos déplacements</legend>
            <div className="mb-4 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><MapPin size={17} /></span><div><p className="text-[10px] uppercase tracking-widest text-white/30">03 · Mobilité</p><h3 className="mt-1 text-sm font-semibold text-white/85">Où réaliser votre projet ?</h3><p className="mt-1 text-[11px] leading-5 text-white/40">Seule votre ville est visible, aucune adresse précise.</p></div></div>
            <div className="grid gap-4">
          <label className="block min-w-0 text-[11px] font-medium text-white/60">
            Mobilité
            <select
              value={mobility}
              onChange={(e) => setMobility(e.target.value)}
              className={selectClass}
            >
              <option value="">Non précisée</option>
              <option value="NONE">Je ne me déplace pas</option>
              <option value="RADIUS">Dans un rayon de X km</option>
              <option value="ANYWHERE">Partout</option>
            </select>
          </label>
          {mobility === "RADIUS" && (
            <label className="block min-w-0 text-[11px] font-medium text-white/60">
              Rayon autour de la ville (km)
              <input
                name="radiusKm"
                type="number"
                min={1}
                max={2000}
                required
                defaultValue={board.projectRadiusKm || 50}
                className={inputClass}
              />
            </label>
          )}
            </div>
          </fieldset>
        </form>
      </SideDrawer>
    </>
  );
}
