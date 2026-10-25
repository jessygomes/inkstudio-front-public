"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Images, LoaderCircle } from "lucide-react";
import { projectRequest, type ProjectProposal } from "@/lib/actions/projects.action";
import { getMoodboardByIdAction, type Moodboard } from "@/lib/actions/moodboard.action";
import SideDrawer from "../Shared/SideDrawer";
import AppButton from "../Shared/AppButton";

type LinkedBoard = { id: string; name: string };

export default function ConversationMoodboards({ conversationId }: { conversationId: string }) {
  const [boards, setBoards] = useState<LinkedBoard[]>([]);
  const [listError, setListError] = useState(false);
  const [selected, setSelected] = useState<LinkedBoard | null>(null);
  const [board, setBoard] = useState<Moodboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setBoards([]);
    setSelected(null);
    const load = async () => {
      try {
        const proposals = await projectRequest<ProjectProposal[]>(`/proposals?conversationId=${encodeURIComponent(conversationId)}`);
        const linked = new Map<string, LinkedBoard>();
        for (const proposal of proposals) {
          if (proposal.status !== "ACCEPTED" || proposal.conversationId !== conversationId) continue;
          const id = proposal.moodboardId || proposal.moodboard.id;
          linked.set(id, { id, name: proposal.moodboard.name });
        }
        if (active) { setBoards([...linked.values()]); setListError(false); }
      } catch { if (active) setListError(true); }
    };
    void load();
    window.addEventListener("unreadCountRefresh", load);
    return () => { active = false; window.removeEventListener("unreadCountRefresh", load); };
  }, [conversationId, retry]);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    setBoard(null);
    setError("");
    setLoading(true);
    void getMoodboardByIdAction(selected.id).then(result => {
      if (!active) return;
      if (!result.ok || !result.data) throw new Error(result.message || "Ce moodboard n’est plus disponible.");
      setBoard(result.data);
    }).catch(error => {
      if (active) setError(error instanceof Error ? error.message : "Impossible de charger ce moodboard.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selected]);

  if (!boards.length && !listError) return null;
  return <>
    <section aria-label="Moodboards liés à la conversation" className="mt-5 border-t border-white/10 pt-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-white"><Images size={15} aria-hidden="true" className="text-tertiary-400" />Moodboard{boards.length > 1 ? "s" : ""} lié{boards.length > 1 ? "s" : ""}</h3>
      {listError && <p role="alert" className="text-[11px] text-white/50">Moodboards indisponibles. <button type="button" onClick={() => setRetry(value => value + 1)} className="cursor-pointer text-tertiary-400 underline">Réessayer</button></p>}
      <div className="space-y-2">{boards.map(item => <button key={item.id} type="button" onClick={() => setSelected(item)} className="flex min-h-12 w-full cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-noir-700 px-3 py-2.5 text-left transition hover:border-tertiary-400/30 hover:bg-white/3 focus-visible:outline-2 focus-visible:outline-tertiary-400"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-tertiary-400/10 text-tertiary-400"><Images size={15} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-white">{item.name}</span><span className="mt-0.5 block text-[10px] text-white/40">Voir les inspirations du projet</span></span><ArrowUpRight size={14} aria-hidden="true" className="shrink-0 text-white/40" /></button>)}</div>
    </section>
    <SideDrawer open={!!selected} title={selected?.name || "Moodboard lié"} description="Les inspirations du projet à l’origine de cette conversation." onClose={() => setSelected(null)} footer={<AppButton type="button" variant="secondary" onClick={() => setSelected(null)} className="min-h-11 cursor-pointer !px-4 !text-xs">Fermer</AppButton>}>
      {loading ? <p role="status" className="flex items-center gap-2 text-xs text-white/50"><LoaderCircle size={15} className="animate-spin" aria-hidden="true" />Chargement du moodboard…</p> : error ? <div role="alert" className="space-y-3 text-xs text-white/60"><p>{error}</p><button type="button" onClick={() => setSelected(previous => previous ? { ...previous } : null)} className="min-h-11 cursor-pointer rounded-lg border border-white/10 px-3">Réessayer</button></div> : board && <div className="space-y-5">
        {board.description && <p className="whitespace-pre-wrap break-words text-xs leading-6 text-white/60">{board.description}</p>}
        {board.images.length ? <div className="grid grid-cols-2 gap-3">{board.images.map((image, index) => <figure key={image.id} className="min-w-0"><a href={image.url} target="_blank" rel="noopener noreferrer" aria-label={`Agrandir ${image.caption || `l’image ${index + 1}`}`} className="relative block aspect-[4/5] overflow-hidden rounded-xl border border-white/10 bg-noir-700 focus-visible:outline-2 focus-visible:outline-tertiary-400"><Image src={image.url} alt={image.caption || `Inspiration ${index + 1}`} fill sizes="(min-width:1024px) 17vw, 50vw" className="object-contain p-1" /></a>{image.caption && <figcaption className="mt-1.5 break-words text-[11px] leading-5 text-white/45">{image.caption}</figcaption>}</figure>)}</div> : <p className="text-xs text-white/40">Ce moodboard ne contient pas encore d’image.</p>}
      </div>}
    </SideDrawer>
  </>;
}
