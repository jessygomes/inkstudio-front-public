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
  saasPlan: boolean;
  Portfolio: PortfolioProps[];
  ProductSalon: ProductSalonProps[];
};
