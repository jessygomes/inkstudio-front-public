"use client";
import { useEffect } from "react";
import { useCookieConsent } from "./CookieConsentContext";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export default function GoogleAnalytics({
  measurementId,
}: GoogleAnalyticsProps) {
  const { analyticsConsent } = useCookieConsent();

  useEffect(() => {
    if (analyticsConsent && measurementId && typeof window !== "undefined") {
      // Vérifier si GA4 n'est pas déjà chargé
      if (document.querySelector(`script[src*="${measurementId}"]`)) {
        return;
      }

      // Charger Google Analytics
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement("script");
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        
        gtag('config', '${measurementId}', {
          cookie_flags: 'SameSite=None;Secure',
          anonymize_ip: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
          custom_map: {
            'salon_type': 'salon_type',
            'city': 'city',
            'tattoo_style': 'tattoo_style'
          }
        });
      `;
      document.head.appendChild(script2);

      console.log(
        "✅ Google Analytics 4 chargé pour TheInkera:",
        measurementId
      );
    }
  }, [analyticsConsent, measurementId]);

  // Fonction utilitaire pour tracker des événements
  useEffect(() => {
    if (analyticsConsent && typeof window !== "undefined") {
      window.gtag =
        window.gtag ||
        function (...args: unknown[]) {
          (window.dataLayer = window.dataLayer || []).push(args);
        };
    }
  }, [analyticsConsent]);

  return null;
}

// Hook pour tracker des événements spécifiques à TheInkera
export function useGoogleAnalytics() {
  const { analyticsConsent } = useCookieConsent();

  const trackEvent = (
    eventName: string,
    parameters?: Record<string, string | number | boolean>
  ) => {
    if (analyticsConsent && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, {
        ...parameters,
        app_name: "TheInkera",
        platform: "web",
      });
      console.log(`📊 Événement GA4 TheInkera:`, eventName, parameters);
    }
  };

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (analyticsConsent && typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "", {
        page_path: pagePath,
        page_title: pageTitle,
      });
      console.log(`📊 Page vue GA4:`, pagePath);
    }
  };

  // Événements spécifiques aux salons de tatouage
  const trackSalonView = (
    salonName: string,
    city?: string,
    salonType?: string
  ) => {
    trackEvent("salon_view", {
      salon_name: salonName,
      city: city || "unknown",
      salon_type: salonType || "tattoo_shop",
    });
  };

  const trackPortfolioView = (
    artistName: string,
    salonName: string,
    style?: string
  ) => {
    trackEvent("portfolio_view", {
      artist_name: artistName,
      salon_name: salonName,
      tattoo_style: style || "mixed",
    });
  };

  const trackBookingAttempt = (salonName: string, city?: string) => {
    trackEvent("booking_attempt", {
      salon_name: salonName,
      city: city || "unknown",
      event_category: "engagement",
    });
  };

  const trackContactSalon = (
    salonName: string,
    contactMethod: "phone" | "website" | "instagram" | "facebook"
  ) => {
    trackEvent("contact_salon", {
      salon_name: salonName,
      contact_method: contactMethod,
      event_category: "engagement",
    });
  };

  const trackSearch = (searchTerm: string, resultsCount: number) => {
    trackEvent("search", {
      search_term: searchTerm,
      results_count: resultsCount,
      event_category: "search",
    });
  };

  const trackDirections = (salonName: string, city?: string) => {
    trackEvent("get_directions", {
      salon_name: salonName,
      city: city || "unknown",
      event_category: "engagement",
    });
  };

  const trackFormSubmission = (
    formType: "contact" | "newsletter" | "feedback"
  ) => {
    trackEvent("form_submit", {
      form_type: formType,
      event_category: "conversion",
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackSalonView,
    trackPortfolioView,
    trackBookingAttempt,
    trackContactSalon,
    trackSearch,
    trackDirections,
    trackFormSubmission,
    canTrack: analyticsConsent,
  };
}
