/* eslint-disable react/no-unescaped-entities */
"use client";
import { MessagingMessage, useMessaging } from "@/lib/hook/useMessaging";
import {
  AttachmentDto,
  ConversationDto,
  ConversationMessageDto,
} from "@/lib/type";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MessageBubbles from "./MessageBubbles";
import MessageInput from "./MessageInput";
import ConversationRDVDetails from "@/components/Messaging/ConversationRDVDetails";
import ConversationRDVModal from "./ConversationRDVModal";
import { getConversationByIdAction } from "@/lib/actions/conversation.action";
import ConversationHeader from "./ConversationHeader";

export default function Conversation() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();

  const [conversation, setConversation] = useState<ConversationDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRDVDetails, setShowRDVDetails] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [deletedMessageIds, setDeletedMessageIds] = useState<Set<string>>(
    new Set()
  );
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const initialMessages = useMemo(
    () => conversation?.messages?.data || [],
    [conversation?.messages?.data]
  );

  const fetchConversation = useCallback(async () => {
    if (!id) {
      setError("ID manquant");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getConversationByIdAction(id);
      setConversation(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      setError(errorMessage);
      console.error("Erreur lors du chargement de la conversation:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  const {
    isConnected,
    messages: liveMessages,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
  } = useMessaging(session?.accessToken);

  // Rejoindre la conversation une fois chargée et socket connecté
  useEffect(() => {
    if (!conversation?.id || !isConnected) return;

    joinConversation(conversation.id);

    return () => {
      leaveConversation(conversation.id);
    };
  }, [conversation?.id, isConnected, joinConversation, leaveConversation]);

  //! Marquer les messages comme lus lorsque reçus
  useEffect(() => {
    if (!conversation?.id || !isConnected) return;

    const messagesToCheck = liveMessages.length
      ? liveMessages
      : initialMessages;

    messagesToCheck.forEach(
      (msg: MessagingMessage | ConversationMessageDto) => {
        const senderId = "sender" in msg ? msg.sender.id : undefined;
        const isAlreadyRead = "isRead" in msg ? msg.isRead : false;

        if (!isAlreadyRead && senderId && senderId !== session?.user?.id) {
          markAsRead(msg.id);
        }
      }
    );
  }, [
    conversation?.id,
    liveMessages,
    initialMessages,
    session?.user?.id,
    markAsRead,
    isConnected,
  ]);

  // Nettoyer le typing indicator au démontage
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (conversation?.id) {
        stopTyping(conversation.id);
      }
    };
  }, [conversation?.id, stopTyping]);

  const otherUser =
    conversation?.salonId === session?.user?.id
      ? conversation?.client
      : conversation?.salon;

  const handleSendMessage = async (
    message: string,
    attachments?: AttachmentDto[]
  ) => {
    if (!conversation?.id) return;

    // Envoyer le message au serveur
    sendMessage(conversation.id, message, attachments);

    if (isTyping) {
      stopTyping(conversation.id);
      setIsTyping(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleInputChange = (value: string) => {
    if (!conversation?.id) return;

    if (!isTyping) {
      startTyping(conversation.id);
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversation.id);
      setIsTyping(false);
    }, 2000);
  };

  const liveMessagesAsDto: ConversationMessageDto[] = liveMessages.map(
    (msg) => ({
      id: msg.id,
      content: msg.content,
      createdAt:
        typeof msg.createdAt === "string"
          ? msg.createdAt
          : msg.createdAt.toISOString(),
      conversationId: conversation?.id || "",
      type: msg.type,
      isRead: msg.isRead,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      attachments: "attachments" in msg ? (msg as any).attachments : [],
      sender: {
        id: msg.sender.id,
        firstName: msg.sender.firstName || "",
        lastName: msg.sender.lastName || "",
        email: msg.sender.email || "",
        image: msg.sender.image,
        salonName: msg.sender.salonName,
        role: msg.sender.role,
      },
    })
  );

  const handleDeleteMessage = useCallback((messageId: string) => {
    setDeletedMessageIds((prev) => new Set(prev).add(messageId));
  }, []);

  const displayedMessages = (
    liveMessagesAsDto.length > 0 ? liveMessagesAsDto : initialMessages
  ).filter((msg) => !deletedMessageIds.has(msg.id));

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages, scrollToBottom]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-tertiary-500/50 rounded-full animate-spin border-t-tertiary-400"></div>
          <p className="text-white font-one">
            Chargement de la conversation...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-noir-700 rounded-xl border border-white/20 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-white font-one font-semibold mb-2">
            Erreur de chargement
          </h3>
          <p className="text-red-400 mb-4 text-sm">{error}</p>
          <button
            onClick={fetchConversation}
            className="cursor-pointer px-4 py-2 bg-tertiary-600 text-white rounded-lg hover:bg-tertiary-700 transition-colors text-sm font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="w-full bg-noir-700 rounded-xl border border-white/20 p-6">
        <div className="text-center py-8">
          <p className="text-white/70 font-one">Aucune conversation trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid h-[calc(100dvh-4rem)] min-h-0 w-full gap-4 lg:h-[calc(100dvh-100px)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section
          aria-label="Conversation"
          className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-noir-700/50 shadow-lg"
        >
          <ConversationHeader
            conversation={conversation}
            otherUser={otherUser}
            isConnected={isConnected}
            onShowDetails={() => setShowRDVDetails(true)}
          />
          <div
            ref={messagesContainerRef}
            role="log"
            aria-label="Messages"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 scrollbar-thin scrollbar-thumb-tertiary-500/30 scrollbar-track-transparent sm:px-6"
          >
            <MessageBubbles
              messages={displayedMessages}
              currentUserId={session?.user?.id ?? undefined}
              onDeleteMessage={handleDeleteMessage}
            />
            {typingUsers.size > 0 && (
              <p role="status" className="mt-4 text-xs text-white/60 font-one">
                Quelqu&apos;un est en train d&apos;écrire...
              </p>
            )}
          </div>
          <MessageInput
            onSendMessage={handleSendMessage}
            onInputChange={handleInputChange}
            disabled={!isConnected}
            className="shrink-0 border-t border-white/10 bg-noir-800/95 p-3 backdrop-blur-sm sm:p-4"
          />
        </section>
        <aside
          aria-label="Détails du rendez-vous"
          className="hidden min-h-0 min-w-0 lg:block"
        >
          <ConversationRDVDetails conversation={conversation} />
        </aside>
      </div>
      {showRDVDetails && (
        <ConversationRDVModal
          conversation={conversation}
          onClose={() => setShowRDVDetails(false)}
        />
      )}
    </>
  );
}
