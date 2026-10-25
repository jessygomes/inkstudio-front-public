"use server";
import { getAuthHeaders } from "../session";

export async function projectRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  if (
    !/^\/(options|proposals(?:\/[\w-]+)?|moodboards\/[\w-]+|professionals\/[\w-]+\/(block|report))(\?.*)?$/.test(
      path,
    )
  )
    throw new Error("Requête invalide.");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/projects${path}`,
    {
      method,
      headers: await getAuthHeaders(),
      cache: "no-store",
      ...(body !== undefined && { body: JSON.stringify(body) }),
    },
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(" · ")
        : data.message || "Opération impossible.",
    );
  return data;
}

export type ProjectProposal = {
  id: string;
  moodboardId: string;
  professionalId: string;
  message: string;
  status: string;
  conversationId?: string;
  blocked: boolean;
  moodboard: { id: string; name: string };
  professional?: { salonName?: string; firstName?: string; lastName?: string; image?: string | null; city?: string | null; postalCode?: string | null };
};

export async function getProjectProposals(conversationId?: string, moodboardId?: string): Promise<ProjectProposal[]> {
  const params = new URLSearchParams();
  if (conversationId) params.set("conversationId", conversationId);
  if (moodboardId) params.set("moodboardId", moodboardId);
  const proposals = await projectRequest<ProjectProposal[]>(
    `/proposals${params.size ? `?${params}` : ""}`,
  );
  const profiles = new Map(await Promise.all(
    [...new Set(proposals.map(item => item.professionalId))].map(async id => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/users/${encodeURIComponent(id)}`, { next: { revalidate: 60 } });
        if (!response.ok) return [id, null] as const;
        const profile = await response.json() as ProjectProposal["professional"];
        return [id, profile ? { salonName: profile.salonName, image: profile.image, city: profile.city, postalCode: profile.postalCode } : null] as const;
      } catch { return [id, null] as const; }
    }),
  ));
  return proposals.map(item => ({ ...item, professional: { ...item.professional, ...profiles.get(item.professionalId) } }));
}
