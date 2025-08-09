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
  tatoueur: {
    id: string;
    name: string;
    img: string;
    description: string;
    email: string;
    phone: string;
  };
  salonPhotos: string[];
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  description: string;
  services: string[];
  artists: string[];
};
