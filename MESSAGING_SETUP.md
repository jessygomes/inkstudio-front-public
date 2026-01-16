# 📬 Système de Messaging - Guide d'implémentation

## Vue d'ensemble

Le système de messaging permet de :

- ✅ Afficher le nombre de messages non lus dans la navbar
- ✅ Synchroniser l'état des conversations entre les pages
- ✅ Mettre à jour le compteur en temps réel

## 🚀 Installation

### 1. Wrapper l'application (déjà fait)

Le `MessagingProvider` est enveloppé dans le layout principal :

```tsx
// app/layout.tsx
<AuthProvider>
  <MessagingProvider>{/* ... */}</MessagingProvider>
</AuthProvider>
```

### 2. Badges dans les navbars (déjà faits)

Les badges s'affichent automatiquement :

- **Desktop (Navbar.tsx)** : Badge sur l'avatar utilisateur
- **Mobile (NavbarMobile.tsx)** : Badge sur l'avatar utilisateur

## 💡 Utilisation

### Option 1 : Hook personnalisé (recommandé)

```tsx
import { useUnreadCount } from "@/lib/hook/useUnreadCount";

export default function MyComponent() {
  const { unreadCount, conversations, updateConversationUnreadCount } =
    useUnreadCount();

  return <div>Messages non lus : {unreadCount}</div>;
}
```

### Option 2 : Context direct

```tsx
import { useMessagingContext } from "@/components/Context/MessageProvider";

export default function MyComponent() {
  const { unreadCount, conversations } = useMessagingContext();

  return <div>Messages non lus : {unreadCount}</div>;
}
```

## 🔄 Mettre à jour en temps réel

### Méthode 1 : Dispatcher un événement personnalisé

```tsx
// Mettre à jour le total
window.dispatchEvent(
  new CustomEvent("unreadCountChanged", {
    detail: { count: 5 },
  })
);

// Mettre à jour une conversation spécifique
window.dispatchEvent(
  new CustomEvent("conversationUnreadUpdated", {
    detail: { conversationId: "conv-123", unreadCount: 2 },
  })
);
```

### Méthode 2 : Utiliser le setter directement

```tsx
import { useMessagingContext } from "@/components/Context/MessageProvider";

export default function MyComponent() {
  const { setUnreadCount, updateConversationUnreadCount } =
    useMessagingContext();

  const handleNewMessage = () => {
    setUnreadCount((prev) => prev + 1);
    // ou
    updateConversationUnreadCount("conv-123", 3);
  };

  return <button onClick={handleNewMessage}>Mark as unread</button>;
}
```

## 📡 Chargement des conversations

Les conversations sont chargées automatiquement au montage du `MessagingProvider` via :

```tsx
getAllConversationsAction();
```

Cette action appelle l'endpoint : `/messaging/conversations`

## 🎯 Interface ConversationDto

```typescript
interface ConversationDto {
  id: string;
  unreadCount?: number;
  // ... autres propriétés
  messages?: Array<any>;
}
```

## 🐛 Débogage

Vérifier les logs dans la console :

```
🚀 ~ file: Navbar.tsx:11 ~ Navbar ~ unreadCount: 5
❌ Error fetching conversations: [error message]
```

## 📌 Notes importantes

1. Le `MessagingProvider` ne peut être utilisé que dans les composants client (`"use client"`)
2. Le chargement initial se fait une seule fois au montage
3. Les événements personnalisés s'écoutent globalement via `window`
4. Le compteur total est recalculé à chaque changement de conversations

## 🔗 Fichiers modifiés/créés

- ✅ `app/layout.tsx` - Wrapper avec MessagingProvider
- ✅ `components/Shared/Navbar/Navbar.tsx` - Badge desktop
- ✅ `components/Shared/Navbar/NavbarMobile.tsx` - Badge mobile
- ✅ `components/Context/MessageProvider.tsx` - Provider avec chargement auto
- ✅ `lib/actions/conversation.action.ts` - Action getAllConversations
- ✅ `lib/hook/useUnreadCount.ts` - Hook personnalisé
