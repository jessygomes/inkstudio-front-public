"use client";

import { ConversationDto } from "@/lib/type";
import { getUnreadMessagesCountAction } from "@/lib/actions/conversation.action";
import { useSession } from "next-auth/react";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface MessagingContextType {
  unreadCount: number;
  conversations: ConversationDto[];
  updateConversationUnreadCount: (
    conversationId: string,
    unreadCount: number
  ) => void;
  setConversations: React.Dispatch<React.SetStateAction<ConversationDto[]>>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(
  undefined
);

export const useMessagingContext = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error(
      "useMessagingContext must be used within MessagingProvider"
    );
  }
  return context;
};

interface MessagingProviderProps {
  children: ReactNode;
}

export const MessagingProvider = ({ children }: MessagingProviderProps) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { status } = useSession();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);

  // Charger le nombre de messages non lus uniquement pour un utilisateur connecté
  useEffect(() => {
    if (status !== "authenticated") {
      setUnreadCount(0);
      return;
    }

    let active = true;
    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadMessagesCountAction();
        if (active) setUnreadCount(count);
      } catch (error) {
        console.warn("Failed to load unread count:", error);
      }
    };
    void loadUnreadCount();
    const interval = window.setInterval(() => void loadUnreadCount(), 15000);
    window.addEventListener("unreadCountRefresh", loadUnreadCount);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("unreadCountRefresh", loadUnreadCount);
    };
  }, [status]);

  // Fonction pour mettre à jour le unreadCount d'une conversation spécifique
  const updateConversationUnreadCount = useCallback(
    (conversationId: string, newUnreadCount: number) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((convo) =>
          convo.id === conversationId
            ? { ...convo, unreadCount: newUnreadCount }
            : convo
        );

        // Recalculer le compteur total UNIQUEMENT quand on met à jour une conversation
        // (pour les mises à jour temps réel)
        // const totalUnread = updatedConversations.reduce(
        //   (count, convo) => count + (convo.unreadCount || 0),
        //   0
        // );

        return updatedConversations;
      });
    },
    [] // setConversations est stable, pas besoin de le mettre en dépendance
  );

  // Le compteur global provient du serveur. Une page partielle de conversations
  // ne doit jamais écraser ce total avec sa propre somme.

  // Écouter les événements globaux - une seule fois au montage
  useEffect(() => {
    const handleUnreadCountChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ count: number }>;
      setUnreadCount(customEvent.detail.count);
    };

    const handleConversationUnreadUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        conversationId: string;
        unreadCount: number;
      }>;
      const { conversationId, unreadCount: newUnreadCount } =
        customEvent.detail;
      updateConversationUnreadCount(conversationId, newUnreadCount);
    };

    window.addEventListener("unreadCountChanged", handleUnreadCountChange);
    window.addEventListener(
      "conversationUnreadUpdated",
      handleConversationUnreadUpdated
    );

    return () => {
      window.removeEventListener("unreadCountChanged", handleUnreadCountChange);
      window.removeEventListener(
        "conversationUnreadUpdated",
        handleConversationUnreadUpdated
      );
    };
  }, [updateConversationUnreadCount]); // Ajouter la dépendance (stable grâce à useCallback)

  return (
    <MessagingContext.Provider
      value={{
        unreadCount,
        conversations,
        updateConversationUnreadCount,
        setConversations,
        setUnreadCount,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};
