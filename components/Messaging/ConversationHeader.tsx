import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { ConversationDto } from "@/lib/type";

interface ConversationHeaderProps {
  conversation: ConversationDto;
  otherUser:
    | ConversationDto["client"]
    | ConversationDto["salon"]
    | undefined;
  isConnected: boolean;
  onShowDetails: () => void;
}

const STATUS_LABELS: Record<ConversationDto["status"], string> = {
  ACTIVE: "Active",
  ARCHIVED: "Archivée",
  CLOSED: "Fermée",
};

export default function ConversationHeader({
  conversation,
  otherUser,
  isConnected,
  onShowDetails,
}: ConversationHeaderProps) {
  const name =
    otherUser?.salonName ||
    [otherUser?.firstName, otherUser?.lastName].filter(Boolean).join(" ") ||
    "Interlocuteur";
  const connectionLabel = isConnected
    ? "Messagerie connectée"
    : "Connexion interrompue";

  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2 sm:gap-3 sm:px-4">
      <Image
        src={otherUser?.image || "/images/default-avatar.png"}
        width={32}
        height={32}
        alt=""
        className="h-8 w-8 shrink-0 rounded-xl object-cover"
      />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 title={name} className="min-w-0 truncate text-sm font-semibold text-white font-one">
          {name}
        </h1>
        <p
          title={conversation.subject}
          className="hidden min-w-0 truncate border-l border-white/10 pl-2 text-xs text-white/50 font-one xl:block"
        >
          {conversation.subject}
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/75 font-one">
        {STATUS_LABELS[conversation.status]}
      </span>
      <span
        role="status"
        aria-label={connectionLabel}
        title={connectionLabel}
        className="flex shrink-0 items-center gap-1.5 text-[11px] text-white/60 font-one"
      >
        <span
          aria-hidden="true"
          className={
            isConnected
              ? "h-1.5 w-1.5 rounded-full bg-emerald-400"
              : "h-1.5 w-1.5 rounded-full bg-amber-400"
          }
        />
        <span className="hidden 2xl:inline">
          {isConnected ? "Connectée" : "Hors connexion"}
        </span>
      </span>
      {conversation.appointmentId && (
        <button
          type="button"
          onClick={onShowDetails}
          aria-label="Voir le rendez-vous"
          title="Voir le rendez-vous"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/15 text-white/75 transition-colors hover:bg-white/10 focus-visible:outline-2 lg:hidden"
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </header>
  );
}