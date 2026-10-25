"use client";

import { useId, type FormEvent } from "react";
import { Images, Plus } from "lucide-react";
import AppButton from "../Shared/AppButton";
import SideDrawer from "../Shared/SideDrawer";

type Props = {
  open: boolean;
  name: string;
  description: string;
  busy: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
};

const inputClass = "mt-1.5 w-full min-w-0 rounded-xl border border-white/10 bg-noir-700/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-tertiary-400/45 focus:ring-2 focus:ring-tertiary-400/10 disabled:opacity-50";

export default function MoodboardCreateModal({ open, name, description, busy, onNameChange, onDescriptionChange, onSubmit, onClose }: Props) {
  const formId = useId();
  return <SideDrawer open={open} title="Créer un moodboard" description="Un espace pour rassembler vos idées et imaginer votre prochain tatouage." busy={busy} onClose={onClose} footer={<>
    <AppButton type="button" variant="secondary" disabled={busy} onClick={onClose} className="min-h-11 flex-1 cursor-pointer !px-4 !text-xs sm:flex-none">Annuler</AppButton>
    <AppButton type="submit" form={formId} disabled={busy || !name.trim()} icon={<Plus size={14} />} className="min-h-11 flex-1 cursor-pointer !px-4 !text-xs !shadow-none sm:flex-none">{busy ? "Création…" : "Créer le moodboard"}</AppButton>
  </>}>
    <form id={formId} onSubmit={onSubmit} aria-busy={busy}>
      <fieldset disabled={busy} className="min-w-0 border-0 p-0">
        <div className="mb-5 flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tertiary-400/10 text-tertiary-400"><Images size={17} /></span><div><p className="text-[10px] font-medium uppercase tracking-widest text-white/30">Votre inspiration</p><h3 className="mt-1 text-sm font-semibold text-white/85">Donnons vie à votre idée</h3><p className="mt-1 text-[11px] leading-5 text-white/40">Choisissez un titre. Vous pourrez ajouter vos images ensuite.</p></div></div>
        <div className="space-y-4">
          <label className="block text-[11px] font-medium text-white/60">Titre du moodboard <span className="text-tertiary-400">*</span><input required name="name" value={name} onChange={event => onNameChange(event.target.value)} placeholder="Mon prochain tatouage" className={inputClass} /></label>
          <label className="block text-[11px] font-medium text-white/60">Description <span className="font-normal text-white/30">· facultative</span><textarea name="description" rows={5} value={description} onChange={event => onDescriptionChange(event.target.value)} placeholder="Une idée, un style, une envie…" className={`${inputClass} resize-y`} /></label>
        </div>
      </fieldset>
      <p className="mt-4 text-[11px] leading-5 text-white/35">Votre moodboard reste privé jusqu’à ce que vous choisissiez de le partager.</p>
    </form>
  </SideDrawer>;
}
