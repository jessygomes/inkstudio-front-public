import { useMessagingContext } from "@/components/Context/MessageProvider";

/**
 * Hook pour utiliser le compteur de messages non lus
 * Retourne le nombre total de messages non lus et les conversations
 */
export const useUnreadCount = () => {
  const { unreadCount, conversations, updateConversationUnreadCount } =
    useMessagingContext();

  return {
    unreadCount,
    conversations,
    updateConversationUnreadCount,
  };
};
