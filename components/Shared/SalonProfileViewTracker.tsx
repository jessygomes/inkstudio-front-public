'use client';

import { useSalonProfileViewTracking } from '@/lib/hook/useSalonProfileViewTracking';
import { ReactNode } from 'react';

interface SalonProfileViewTrackerProps {
  salonId: string;
  slug: string;
  loc: string;
  children: ReactNode;
}

/**
 * Composant client pour tracker les visites du profil salon
 * Enveloppe le contenu de la page et déclenche le tracking
 */
export function SalonProfileViewTracker({
  salonId,
  slug,
  loc,
  children,
}: SalonProfileViewTrackerProps) {
  useSalonProfileViewTracking(salonId, slug, loc);

  return <>{children}</>;
}
