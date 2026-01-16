"use server";
import { getAuthHeaders } from "../session";
import { ConversationDto } from "../type";

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
      `${process.env.NEXT_PUBLIC_BACK_URL}/messaging/conversations/${conversationId}/mark-as-read`,
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
  }
};
