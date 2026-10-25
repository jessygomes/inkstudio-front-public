"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, Info, MapPin, MessageCircle, RefreshCw, Search, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { toSlug } from "@/lib/utils";
import type { AttachmentDto, ConversationDto, ConversationMessageDto } from "@/lib/type";
import {
  getConversationAppointmentsAction,
  getConversationByIdAction,
  getConversationsAction,
  markConversationAsReadAction,
  type ConversationAppointment,
} from "@/lib/actions/conversation.action";
import { useMessaging } from "@/lib/hook/useMessaging";
import MessageInput from "@/components/Messaging/MessageInput";
import MessageBubbles from "@/components/Messaging/MessageBubbles";
import ConversationMoodboards from "@/components/Messaging/ConversationMoodboards";
import ConversationRDVDetails from "@/components/Messaging/ConversationRDVDetails";

type MobilePane = "list" | "chat" | "details";

const professionalName = (conversation: ConversationDto) =>
  conversation.salon.salonName ||
  [conversation.salon.firstName, conversation.salon.lastName].filter(Boolean).join(" ") ||
  "Professionnel Inkera";

const relativeDate = (raw?: string) => raw ? new Date(raw).toLocaleDateString("fr-FR", {
  day: "2-digit", month: "short", year: "numeric",
}) : "";

const refreshUnread = () => window.dispatchEvent(new Event("unreadCountRefresh"));

export default function PeopleInboxWorkspace() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("conversation");
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [listPage, setListPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [listCollapsed, setListCollapsed] = useState(false);
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;
  const [conversation, setConversation] = useState<ConversationDto | null>(null);
  const [detailError, setDetailError] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");
  const [appointments, setAppointments] = useState<ConversationAppointment[]>([]);
  const [rdvPage, setRdvPage] = useState(1);
  const [rdvTotal, setRdvTotal] = useState(0);
  const [rdvPages, setRdvPages] = useState(1);
  const [rdvLoading, setRdvLoading] = useState(false);
  const [rdvError, setRdvError] = useState("");
  const [activeRDV, setActiveRDV] = useState<ConversationAppointment | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const {
    isConnected, messages: liveMessages, joinConversation, leaveConversation,
    sendMessage, markAsRead, typingUsers,
  } = useMessaging(session?.accessToken);

  const refreshThreads = useCallback(async () => {
    try {
      const result = await getConversationsAction(listPage);
      setConversations(result.data);
      setTotalPages(Math.max(1, result.totalPages));
      setListError("");
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Liste indisponible");
    } finally {
      setLoadingList(false);
    }
  }, [listPage]);

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const result = await getConversationByIdAction(id);
      if (selectedIdRef.current !== id) return;
      setConversation(result);
      setDetailError("");
      setConversations((items) => items.map((item) => item.id === id ? { ...item, unreadCount: 0 } : item));
      refreshUnread();
    } catch (error) {
      if (selectedIdRef.current === id) {
        setDetailError(error instanceof Error ? error.message : "Conversation indisponible");
      }
    } finally {
      if (selectedIdRef.current === id) setLoadingDetail(false);
    }
  }, []);

  useEffect(() => { void refreshThreads(); }, [refreshThreads]);

  useEffect(() => {
    const interval = window.setInterval(() => void refreshThreads(), 10000);
    const onUnread = () => void refreshThreads();
    window.addEventListener("unreadCountRefresh", onUnread);
    return () => { window.clearInterval(interval); window.removeEventListener("unreadCountRefresh", onUnread); };
  }, [refreshThreads]);

  useEffect(() => {
    if (!selectedId) { setConversation(null); return; }
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (!selectedId || !isConnected) return;
    joinConversation(selectedId);
    return () => leaveConversation(selectedId);
  }, [selectedId, isConnected, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!selectedId || !liveMessages.length) return;
    // Une conversation ouverte est lue dès l'arrivée du message (pas uniquement au rechargement).
    const incoming = liveMessages.filter((msg) => msg.conversationId === selectedId && msg.sender?.id !== session?.user?.id && !msg.isRead);
    incoming.forEach((msg) => markAsRead(msg.id));
    if (incoming.length) {
      void markConversationAsReadAction(selectedId).then(() => {
        setConversations((items) => items.map((item) => item.id === selectedId ? { ...item, unreadCount: 0 } : item));
        refreshUnread();
      }).catch(() => undefined);
    }
  }, [selectedId, liveMessages, session?.user?.id, markAsRead]);

  useEffect(() => {
    if (!selectedId) { setAppointments([]); setRdvTotal(0); return; }
    let active = true;
    setRdvLoading(true);
    setRdvError("");
    void getConversationAppointmentsAction(selectedId, rdvPage).then((result) => {
      if (!active) return;
      setAppointments(result.data);
      setRdvTotal(result.total);
      setRdvPages(Math.max(1, result.totalPages));
    }).catch((error) => {
      if (active) setRdvError(error instanceof Error ? error.message : "Rendez-vous indisponibles");
    }).finally(() => { if (active) setRdvLoading(false); });
    return () => { active = false; };
  }, [selectedId, rdvPage]);

  const selectConversation = (id: string) => {
    setSelectedId(id);
    setConversation(null);
    setDetailError("");
    setMobilePane("chat");
    setActiveRDV(null);
    setRdvPage(1);
  };

  useEffect(() => {
    if (initialConversationId && selectedIdRef.current !== initialConversationId) {
      selectConversation(initialConversationId);
    }
    // La sélection initiale provient de l'URL et ne doit pas se rejouer à chaque clic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId]);

  const visibleConversations = conversations.filter((item) =>
    `${professionalName(item)} ${item.subject || ""}`.toLocaleLowerCase("fr-FR").includes(query.toLocaleLowerCase("fr-FR")),
  );

  const displayedMessages = useMemo<ConversationMessageDto[]>(() => {
    if (!conversation || conversation.id !== selectedId) return [];
    const merged = new Map<string, ConversationMessageDto>();
    conversation.messages?.data?.forEach((item) => merged.set(item.id, item));
    liveMessages.filter((message) => message.conversationId === selectedId).forEach((item) => {
      merged.set(item.id, {
        id: item.id, content: item.content, createdAt: typeof item.createdAt === "string" ? item.createdAt : item.createdAt.toISOString(),
        conversationId: selectedId, isRead: item.isRead, type: item.type,
        attachments: item.attachments?.map((file) => ({ ...file, url: file.fileUrl })),
        sender: {
          id: item.sender.id, firstName: item.sender.firstName || "", lastName: item.sender.lastName || "",
          email: item.sender.email || "", image: item.sender.image, salonName: item.sender.salonName, role: item.sender.role,
        },
      });
    });
    return [...merged.values()].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [conversation, liveMessages, selectedId]);

  const latestMessageId = displayedMessages.at(-1)?.id;
  useEffect(() => {
    const container = messagesScrollRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [selectedId, latestMessageId]);

  const handleSendMessage = async (message: string, attachments?: AttachmentDto[]) => {
    if (!selectedId || !isConnected) throw new Error("Connexion à la messagerie indisponible");
    sendMessage(selectedId, message || (attachments?.length ? "📷 Photo" : ""), attachments);
    requestAnimationFrame(() => {
      const container = messagesScrollRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    });
  };

  const name = conversation ? professionalName(conversation) : "";
  const salon = conversation?.salon;
  const profileLink = salon?.city && salon?.postalCode && name
    ? `/salon/${toSlug(name)}/${toSlug(salon.city)}-${salon.postalCode}`
    : null;

  return (
    <>
    <section aria-label="Messagerie Inkera People" className="relative h-[calc(100dvh-220px)] min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-noir-700 text-white font-one shadow-xl">
      <div className={`grid h-full min-h-0 grid-cols-1 ${listCollapsed ? "lg:grid-cols-[56px_minmax(0,1fr)]" : "lg:grid-cols-[300px_minmax(0,1fr)]"} ${detailsCollapsed ? (listCollapsed ? "xl:grid-cols-[56px_minmax(0,1fr)]" : "xl:grid-cols-[340px_minmax(0,1fr)]") : listCollapsed ? "xl:grid-cols-[56px_minmax(0,1fr)_340px]" : "xl:grid-cols-[320px_minmax(0,1fr)_340px] 2xl:grid-cols-[360px_minmax(0,1fr)_380px]"}`}>
        <aside className={`${mobilePane === "list" ? "flex" : "hidden"} min-h-0 min-w-0 flex-col border-r border-white/10 bg-noir-600 lg:flex`}>
          {listCollapsed && <button type="button" aria-label="Afficher les conversations" aria-expanded={false} onClick={() => setListCollapsed(false)} className="cursor-pointer disabled:cursor-not-allowed hidden h-12 shrink-0 items-center justify-center text-white/60 hover:bg-white/5 lg:flex"><PanelLeftOpen size={18}/></button>}
          <div className={listCollapsed ? "flex min-h-0 flex-1 flex-col lg:hidden" : "flex min-h-0 flex-1 flex-col"}><div className="border-b border-white/10 p-4"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Conversations</h2><div className="flex items-center gap-1"><button type="button" onClick={() => void refreshThreads()} aria-label="Actualiser les conversations" className="cursor-pointer disabled:cursor-not-allowed rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"><RefreshCw size={16}/></button><button type="button" aria-label="Replier les conversations" aria-expanded={true} onClick={() => setListCollapsed(true)} className="cursor-pointer disabled:cursor-not-allowed hidden rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:inline-flex"><PanelLeftClose size={18}/></button></div></div>
            <label className="relative mt-3 block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={15}/><input aria-label="Rechercher une conversation" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un salon…" className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs outline-none focus:border-tertiary-400"/></label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {loadingList && <p className="p-3 text-xs text-white/55">Chargement des conversations…</p>}
            {listError && <p role="alert" className="p-3 text-xs text-red-300">{listError}</p>}
            {!loadingList && !listError && visibleConversations.length === 0 && <div className="px-5 py-12 text-center text-white/45"><MessageCircle className="mx-auto mb-3" size={24}/><p className="text-xs">Aucune conversation. Vous pouvez contacter un tatoueur depuis son profil public.</p></div>}
            {visibleConversations.map((item) => <button type="button" key={item.id} onClick={() => selectConversation(item.id)} className={`cursor-pointer disabled:cursor-not-allowed mb-1 flex w-full items-center gap-3 rounded-xl border-l-2 p-3 text-left transition ${selectedId === item.id ? "border-tertiary-400 bg-tertiary-400/15" : (item.unreadCount || 0) > 0 ? "border-tertiary-400 bg-tertiary-400/10" : "border-transparent hover:bg-white/5"}`}>
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/10"><Image src={item.salon.image || "/images/default-avatar.png"} alt="" fill sizes="40px" className="object-cover"/></div>
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`truncate text-xs ${(item.unreadCount || 0) > 0 ? "font-bold" : "font-medium"}`}>{professionalName(item)}</span>{(item.unreadCount || 0) > 0 && <span className="ml-auto shrink-0 rounded-full bg-tertiary-400 px-1.5 py-0.5 text-[10px] font-bold">{item.unreadCount}</span>}</div><p className="mt-1 truncate text-[11px] text-white/45">{item.lastMessage?.content || item.subject || "Ouvrir la conversation"}</p><span className="mt-1 block text-[10px] text-white/35">{relativeDate(item.lastMessageAt)}</span></div>
            </button>)}
          </div>
          {totalPages > 1 && <div className="flex shrink-0 items-center justify-between border-t border-white/10 p-3 text-xs text-white/55"><button type="button" aria-label="Conversations précédentes" disabled={listPage <= 1} onClick={() => setListPage((v) => v - 1)} className="cursor-pointer disabled:cursor-not-allowed p-2 disabled:opacity-30"><ChevronLeft size={16}/></button>{listPage} / {totalPages}<button type="button" aria-label="Conversations suivantes" disabled={listPage >= totalPages} onClick={() => setListPage((v) => v + 1)} className="cursor-pointer disabled:cursor-not-allowed p-2 disabled:opacity-30"><ChevronRight size={16}/></button></div>}
          </div>
        </aside>

        <div className={`${mobilePane === "chat" ? "flex" : "hidden"} min-h-0 min-w-0 flex-col bg-noir-700 lg:flex`}>
          {!selectedId ? <div className="m-auto px-6 text-center text-white/45"><MessageCircle className="mx-auto mb-3 text-tertiary-400/50" size={34}/><p className="text-sm">Choisissez une conversation</p></div> : <>
            <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2 sm:px-4"><button type="button" aria-label="Retour aux conversations" onClick={() => setMobilePane("list")} className="cursor-pointer disabled:cursor-not-allowed rounded-lg p-2 hover:bg-white/10 lg:hidden"><ArrowLeft size={17}/></button><div className="flex min-w-0 flex-1 items-center gap-3"><p className="truncate text-sm font-semibold">{conversation ? name : "Conversation"}</p><p className="shrink-0 text-[11px] text-white/50">{isConnected ? "En ligne" : "Reconnexion…"}</p></div><button type="button" onClick={() => setMobilePane("details")} className="cursor-pointer disabled:cursor-not-allowed inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs hover:bg-white/10 xl:hidden"><Info size={15}/> Afficher les détails</button><button type="button" aria-label={detailsCollapsed ? "Afficher les détails" : "Replier les détails"} aria-expanded={!detailsCollapsed} onClick={() => setDetailsCollapsed((v) => !v)} className="cursor-pointer disabled:cursor-not-allowed hidden h-8 w-8 shrink-0 items-center justify-center text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-tertiary-400 xl:flex">{detailsCollapsed ? <PanelRightOpen size={18}/> : <PanelRightClose size={18}/>}</button></div>
            {loadingDetail ? <p className="m-auto text-xs text-white/50">Chargement des messages…</p> : detailError ? <div className="m-auto px-4 text-center text-xs text-red-300">{detailError}<button onClick={() => void loadDetail(selectedId)} className="cursor-pointer disabled:cursor-not-allowed mt-3 block underline">Réessayer</button></div> : <>
              <div ref={messagesScrollRef} role="log" aria-label="Messages de la conversation" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-8"><MessageBubbles compact messages={displayedMessages} currentUserId={session?.user?.id}/>{typingUsers.size > 0 && <p className="text-xs italic text-white/40">En train d’écrire…</p>}</div>
              <div className="shrink-0 border-t border-white/10 bg-noir-700 p-2 sm:px-3 sm:py-2"><MessageInput compact key={selectedId} onSendMessage={handleSendMessage} disabled={!isConnected}/></div>
            </>}
          </>}
        </div>

        <aside className={`${mobilePane === "details" ? "flex" : "hidden"} absolute inset-0 z-10 min-h-0 min-w-0 flex-col overflow-hidden xl:static xl:z-auto border-l border-white/10 bg-noir-600 ${detailsCollapsed ? "xl:hidden" : "xl:flex"}`}>
          {!conversation ? <div className="m-auto px-4 text-center text-xs text-white/40">Sélectionnez une conversation pour consulter les informations du professionnel et vos rendez-vous.</div> : <>
            {activeRDV ? <ConversationRDVDetails key={activeRDV.id} embedded onBack={() => setActiveRDV(null)} conversation={{...conversation, appointmentId: activeRDV.id}}/> : <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <button type="button" onClick={() => setMobilePane("chat")} className="cursor-pointer disabled:cursor-not-allowed mb-4 inline-flex items-center gap-2 rounded-lg p-2 text-xs text-white/65 hover:bg-white/10 xl:hidden"><ArrowLeft size={15}/> Retour aux messages</button>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/55">Salon / artiste</h3>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-3"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white/10"><Image src={salon?.image || "/images/default-avatar.png"} fill sizes="48px" className="object-cover" alt="Photo du professionnel"/></div><div className="min-w-0"><p className="truncate text-sm font-semibold">{name}</p><p className="mt-1 flex items-start gap-1 text-[11px] text-white/50"><MapPin size={12} className="mt-0.5 shrink-0"/>{[salon?.city, salon?.postalCode].filter(Boolean).join(" ") || "Lieu non renseigné"}</p></div></div>
                {profileLink ? <Link href={profileLink} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-tertiary-400/40 bg-tertiary-400/10 px-3 py-2.5 text-xs font-semibold text-tertiary-300 hover:bg-tertiary-400/20"><ExternalLink size={13}/> Voir le profil</Link> : <span className="mt-3 block text-center text-[11px] text-white/35">Profil public indisponible</span>}
              </div>
              <ConversationMoodboards key={conversation.id} conversationId={conversation.id} />
              <div className="mt-5 border-t border-white/10 pt-4"><h3 className="mb-3 flex items-center gap-2 text-xs font-semibold"><CalendarDays size={15} className="text-tertiary-400"/> Mes rendez-vous ({rdvTotal})</h3>
                {rdvLoading && <p className="text-xs text-white/45">Chargement…</p>}
                {rdvError && <p role="alert" className="text-xs text-red-300">{rdvError}</p>}
                {!rdvLoading && !rdvError && appointments.length === 0 && <p className="text-xs text-white/45">Aucun rendez-vous avec ce professionnel.</p>}
                <div className="space-y-1.5">{appointments.map((item) => {
                  const date = new Date(item.start);
                  return <button type="button" key={item.id} onClick={() => setActiveRDV(item)} className="cursor-pointer disabled:cursor-not-allowed flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-left transition hover:border-tertiary-400/35 hover:bg-white/10">
                    <time dateTime={item.start} className="flex w-11 shrink-0 flex-col items-center rounded-lg bg-white/5 px-1 py-1 tabular-nums">
                      <span className="text-lg font-semibold leading-none text-white">{date.toLocaleDateString("fr-FR", { day: "2-digit" })}</span>
                      <span className="mt-0.5 text-[9px] uppercase text-white/60">{date.toLocaleDateString("fr-FR", { month: "short" })}</span>
                      <span className="mt-0.5 text-[9px] text-white/40">{date.getFullYear()}</span>
                    </time>
                    <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{item.title}</span><span className="mt-1 flex items-center gap-2 text-[11px] text-white/50"><span className="min-w-0 truncate">{item.prestation.replaceAll("_", " ")}</span><span className="shrink-0 text-white/35">{date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span></span></span>
                    <ChevronRight size={15} className="shrink-0 text-white/35"/>
                  </button>;
                })}</div>
                {rdvPages > 1 && <div className="mt-3 flex items-center justify-between gap-2 text-xs text-white/50"><button type="button" disabled={rdvPage <= 1} onClick={() => setRdvPage((v) => v - 1)} className="cursor-pointer disabled:cursor-not-allowed rounded-lg border border-white/10 px-2 py-2 disabled:opacity-30"><ChevronLeft size={15}/></button>{rdvPage} / {rdvPages}<button type="button" disabled={rdvPage >= rdvPages} onClick={() => setRdvPage((v) => v + 1)} className="cursor-pointer disabled:cursor-not-allowed rounded-lg border border-white/10 px-2 py-2 disabled:opacity-30"><ChevronRight size={15}/></button></div>}
              </div>
            </div>}
          </>}
        </aside>
      </div>
    </section>
    </>
  );
}
