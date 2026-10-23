"use server";
import { getAuthHeaders } from "../session";
import { ConversationDto, PaginatedConversationsDto } from "../type";

const apiBase = () => process.env.NEXT_PUBLIC_BACK_URL;

/** Liste des discussions accessibles au client, paginée et triée par activité. */
export const getConversationsAction = async (page = 1): Promise<PaginatedConversationsDto> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiBase()}/messaging/conversations?page=${Math.max(1, page)}&limit=20`, {
    headers, cache: "no-store",
  });
  if (!response.ok) throw new Error(`Chargement des conversations impossible (${response.status}).`);
  return response.json();
};

export type ConversationAppointment = {
  id: string;
  title: string;
  prestation: string;
  start: string;
  end: string;
  status: string;
};

export const getConversationAppointmentsAction = async (conversationId: string, page = 1): Promise<{
  data: ConversationAppointment[]; total: number; page: number; totalPages: number;
}> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${apiBase()}/messaging/conversations/${encodeURIComponent(conversationId)}/appointments?page=${Math.max(1, page)}`, {
    headers, cache: "no-store",
  });
  if (!response.ok) throw new Error(`Rendez-vous indisponibles (${response.status}).`);
  return response.json();
};

/** Depuis le profil public : récupère la conversation Inkera existante ou en crée une sans RDV. */
export const startConversationFromPublicProfileAction = async (
  professionalUserId: string,
): Promise<{ id: string }> => {
  if (!professionalUserId) throw new Error("Profil professionnel manquant.");

  const headers = await getAuthHeaders();
  if (!headers.Authorization) throw new Error("Connectez-vous avec un compte client Inkera.");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/start`,
    {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({ professionalUserId }),
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result?.message;
    throw new Error(Array.isArray(message) ? message.join(" · ") : message || "Impossible d'ouvrir la conversation.");
  }
  if (typeof result?.id !== "string") throw new Error("Identifiant de conversation manquant.");
  return { id: result.id };
};

//! ============================================================================
//! RECUPERER LE NOMBRE DE MESSAGES NON LUS
//! ============================================================================
export const getUnreadMessagesCountAction = async (): Promise<number> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/unread/total`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  // Utilisateur non connecte: cas attendu, on retourne simplement 0 message non lu.
  if (response.status === 401 || response.status === 403) {
    return 0;
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch unread messages count: ${response.statusText}`
    );
  }
  const data = await response.json();

  return data.totalUnread;
};

//! ============================================================================
//! RECUPERER UNE CONVERSATION PAR SLUG (prenom_prestation)
//! ============================================================================
export type ConversationResponseDto = ConversationDto;

export const getConversationByIdAction = async (
  id: string
): Promise<ConversationResponseDto> => {
  const headers = await getAuthHeaders();

  if (!id) {
    throw new Error("Invalid conversation ID");
  }

  // Récupérer la conversation complète avec tous les messages
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/${id}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  const messageResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/${id}/messages`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.statusText}`);
  }

  if (!messageResponse.ok) {
    throw new Error(
      `Failed to fetch conversation messages: ${messageResponse.statusText}`
    );
  }

  const conversationData = await response.json();
  const messagesData = await messageResponse.json();

  return {
    ...conversationData,
    messages: messagesData,
  };
};

//! ============================================================================
//! DELETE UN MESSAGE
//! ============================================================================
export const deleteMessageAction = async (
  conversationId: string,
  messageId: string
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/messages/${messageId}`,
    {
      method: "DELETE",
      headers,
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to delete message: ${response.statusText}`);
  }
  return;
};

//! ============================================================================
//! MARQUER UNE CONVERSATION COMME LUE
//! ============================================================================
export const markConversationAsReadAction = async (
  conversationId: string
): Promise<void> => {
  const headers = await getAuthHeaders();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/${conversationId}/mark-read`,
      {
        method: "PATCH",
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to mark conversation as read: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("❌ Error marking conversation as read:", error);
    throw error;
  }
};
