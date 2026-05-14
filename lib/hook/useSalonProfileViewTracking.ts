import { useEffect, useRef } from 'react';

/**
 * Hook pour tracker les visites du profil public d'un salon
 * Envoie une requête au backend lors du premier chargement de la page
 */
export function useSalonProfileViewTracking(
  salonId: string,
  slug: string,
  loc: string
) {
  const trackedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!salonId) return;

    const trackingKey = `salon-profile-view:${salonId}:${slug}:${loc}`;
    if (trackedKeyRef.current === trackingKey) return;
    trackedKeyRef.current = trackingKey;

    try {
      if (sessionStorage.getItem(trackingKey) === '1') return;
      sessionStorage.setItem(trackingKey, '1');
    } catch {
      // Si sessionStorage n'est pas disponible, on continue avec le garde-fou useRef.
    }

    // Tracker la visite (non-blocking)
    const trackView = async () => {
      try {
        await fetch('/api/salon/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            salonId,
            slug,
            loc,
          }),
        });
      } catch (error) {
        console.debug('Failed to track salon profile view:', error);
        // Silencieusement échouer - le tracking ne doit pas bloquer l'UX
      }
    };

    trackView();
  }, [salonId, slug, loc]);
}
