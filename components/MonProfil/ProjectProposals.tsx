"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { projectRequest, getProjectProposals, type ProjectProposal } from "@/lib/actions/projects.action";
import { useRouter } from "next/navigation";
import ProjectProposalCard from "./ProjectProposalCard";

type Proposal = ProjectProposal;
export default function ProjectProposals({
  conversationId,
  moodboardId,
  onChanged,
  onLoaded,
  pendingOnly = false,
}: {
  conversationId?: string;
  moodboardId?: string;
  onChanged?: () => void;
  onLoaded?: (items: ProjectProposal[]) => void;
  pendingOnly?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const load = useCallback(async () => {
    try {
      const proposals = await getProjectProposals(conversationId, moodboardId);
      setItems(proposals);
      onLoaded?.(proposals);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Demandes indisponibles.",
      );
    } finally {
      setLoading(false);
    }
  }, [conversationId, moodboardId, onLoaded]);
  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 30000);
    return () => clearInterval(timer);
  }, [load]);
  async function act(
    item: Proposal,
    action: "ACCEPTED" | "REFUSED" | "block" | "report",
  ) {
    setBusy(item.id);
    try {
      if (action === "block")
        await projectRequest(
          `/professionals/${item.professionalId}/block`,
          item.blocked ? "DELETE" : "POST",
        );
      else if (action === "report") {
        await projectRequest(
          `/professionals/${item.professionalId}/report`,
          "POST",
          { reason, proposalId: item.id },
        );
        setReport(null);
        setReason("");
        toast.success("Signalement envoyé.");
      } else {
        const response = await projectRequest<{ conversationId?: string }>(
          `/proposals/${item.id}`,
          "PATCH",
          {
            status: action,
          },
        );
        if (action === "ACCEPTED" && response.conversationId) {
          router.push(
            `/mon-profil?tab=messagerie&conversation=${encodeURIComponent(response.conversationId)}`,
          );
        }
      }
      await load();
      onChanged?.();
      window.dispatchEvent(new Event("unreadCountRefresh"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Opération impossible.",
      );
    } finally {
      setBusy(null);
    }
  }
  if (loading)
    return (
      <p className="p-3 text-sm text-white/60">
        Chargement des demandes de projet…
      </p>
    );
  if (error)
    return (
      <p role="alert" className="p-3 text-sm text-red-300">
        {error} <button onClick={() => void load()}>Réessayer</button>
      </p>
    );
  const visibleItems = items.filter(item =>
    (!pendingOnly || item.status === "PENDING") &&
    (!moodboardId || item.status !== "ACCEPTED"),
  );
  if (!visibleItems.length)
    return conversationId || pendingOnly ? null : (
      <p className="text-sm text-white/60">
        {moodboardId ? "Aucune proposition pour ce moodboard pour le moment." : "Aucune proposition pour vos projets pour le moment."}
      </p>
    );
  return (
    <section aria-label="Demandes de contact pour mes projets" className="grid w-full min-w-0 grid-cols-1 gap-2 font-one">
      {visibleItems.map(item => (
        <ProjectProposalCard
          key={item.id}
          proposal={item}
          disabled={busy !== null}
          showConversation={!conversationId}
          onAccept={() => void act(item, "ACCEPTED")}
          onRefuse={() => void act(item, "REFUSED")}
          onBlock={() => void act(item, "block")}
          onReport={() => { setReport(item.id); setReason(""); }}
        >
          {report === item.id && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void act(item, "report");
              }}
              className="space-y-2"
            >
              <label className="block text-sm">
                Motif du signalement
                <textarea
                  required
                  minLength={5}
                  maxLength={3000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/20 bg-noir-800 p-2"
                />
              </label>
              <button
                disabled={busy !== null}
                className="min-h-11 rounded-lg border border-red-300 px-3"
              >
                Envoyer le signalement
              </button>
              <button
                type="button"
                onClick={() => setReport(null)}
                className="min-h-11 px-3"
              >
                Annuler
              </button>
            </form>
          )}
        </ProjectProposalCard>
      ))}
    </section>
  );
}
