export type SalonProps = {
  id: string;
  salonName: string;
  image: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  salonHours: string;
  Tatoueur: {
    id: string;
    name: string;
    img: string;
    description: string;
    email: string;
    phone: string;
    style: string[];
    skills: string[];
  }[];
  salonPhotos: string[];
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  description: string;
  prestations: string[];
};

export type TatoueurProps = {
  id: string;
  name: string;
  img: string;
  description: string;
  email: string;
  phone: string;
  instagram: string;
};

export type PortfolioProps = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tatoueurId: string;
};

export type ProductSalonProps = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  salonId: string;
};

export type UsersResponse = {
  error: boolean;
  users: SalonProps[];
  pagination: {
    currentPage: number;
    limit: number;
    totalUsers: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
  };
  filters: { query: string | null; city: string | null };
};

export type SalonProfilProps = {
  id: string;
  salonName: string;
  image: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  salonHours: string;
  Tatoueur: TatoueurProps;
  salonPhotos: string[];
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  description: string;
  colorProfile: string;
  colorProfileBis: string;
  saasPlan: string;
  Portfolio: PortfolioProps[];
  ProductSalon: ProductSalonProps[];
};

export type FavoriteSalon = {
  id: string;
  clientId: string;
  salonId?: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  role: string;
  clientProfile: ClientProfile | null;
  favoriteUsers: FavoriteSalon[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appointmentsAsClient: any[];
  createdAt: string;
  updatedAt: string;
};

export type ClientProfile = {
  id: string;
  pseudo: string | null;
  birthDate: string | null;
  city: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isClient: boolean;
  isSalon: boolean;
  isAdmin: boolean;
};

export type ConversationStatus = "ACTIVE" | "ARCHIVED" | "CLOSED";
export type MessageType = "SYSTEM" | "USER" | "CLIENT";

export interface ConversationUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string | null;
  salonName?: string;
  role?: string;
}

export interface ConversationMessageDto {
  id: string;
  content: string;
  createdAt: string;
  conversationId: string;
  type?: MessageType;
  isRead: boolean;
  attachments?: Array<{
    id: string;
    url: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }>;
  sender: ConversationUserDto;
}

export interface AttachmentDto {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadThingKey?: string;
}

export interface MessagesResponseDto {
  data: ConversationMessageDto[];
  hasMore: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface ConversationDto {
  id: string;
  salonId: string;
  clientUserId: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  subject?: string;
  appointmentId?: string;
  unreadCount?: number;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    type?: MessageType;
  };
  salon: ConversationUserDto;
  client: ConversationUserDto;
  messages?: MessagesResponseDto;
}

export interface PaginatedConversationsDto {
  data: ConversationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AppointmentProps {
  id: string;
  title: string;
  description: string;
  start: string; // Date au format ISO
  end: string; // Date au format ISO
  allDay?: boolean;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "DECLINED"
    | "CANCELLED"
    | "COMPLETED"
    | "NO_SHOW"
    | "RESCHEDULING";
  prestation: "TATTOO" | "PIERCING" | "RETOUCHE" | "PROJET";
  zone: string;
  size: number;
  estimatedPrice: number;
  tatoueurId: string;
  userId: string;
  clientId: string;
  tatoueur: {
    id: string;
    name: string;
    img?: string;
  };
  isPayed: boolean;
  tattooDetail?: {
    description?: string;
    zone?: string;
    size?: string;
    colorStyle?: string;
    reference?: string;
    sketch?: string;
    price?: number;
    estimatedPrice?: number;
  };
}

// --- Types
export type PiercingZone = {
  id: string;
  piercingZone: string;
  isActive: boolean;
  servicesCount: number;
  services: PiercingService[];
};

export type PiercingService = {
  id: string;
  specificZone: boolean;
  price: number;
  description: string | null;
  piercingZoneOreille?: string | null;
  piercingZoneVisage?: string | null;
  piercingZoneBouche?: string | null;
  piercingZoneCorps?: string | null;
  piercingZoneMicrodermal?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Tatoueur = {
  id: string;
  name: string;
  img?: string | null;
  instagram?: string | null;
  rdvBookingEnabled: boolean;
};

export type SalonSummary = {
  id: string; // = userId du salon
  name: string;
  image?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  tatoueurs?: Tatoueur[] | null;
  prestations: string[];
  addConfirmationEnabled: boolean;
  appointmentBookingEnabled?: boolean; // Changé de requireConfirmation à appointmentBookingEnabled
};

export type Props = {
  salon: SalonSummary; // salon courant (obligatoire)
  apiBase?: string; // override si besoin
  defaultTatoueurId?: string | null; // préférence optionnelle
};
