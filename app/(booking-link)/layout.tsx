import { auth } from "@/auth";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import { EditAppointmentProvider } from "@/components/Context/EditAppointmentContext";
import { MessagingProvider } from "@/components/Context/MessageProvider";
import { UserProvider } from "@/components/Context/UserContext";
import { Toaster } from "@/components/Shared/Sonner";
import Footer from "@/components/Shared/Footer";
import Header from "@/components/Shared/Header";
import SiteFrame from "@/components/Shared/SiteFrame";
import { hasUsableSession } from "@/lib/auth-security";

/**
 * Pages contenant un token de réservation dans l'URL.
 * Même habillage que (root), mais sans Google Analytics ni bannière cookies :
 * l'URL (et donc le token) ne doit jamais être transmise à un outil d'analyse.
 */
export default async function BookingLinkLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const usable = hasUsableSession(session) ? session : null;
  const user = {
    id: usable?.user.id || "",
    firstName: usable?.user.firstName || "",
    lastName: usable?.user.lastName || "",
    email: usable?.user.email || "",
    phone: usable?.user.phone || "",
    image: usable?.user.image || "",
    birthDate: "",
    role: usable?.user.role || "",
    isAuthenticated: !!usable,
    clientProfile: usable?.user.clientProfile || null,
  };

  return (
    <AuthProvider>
      <MessagingProvider>
        <EditAppointmentProvider>
          <Toaster />
          <UserProvider user={user}>
            <SiteFrame header={<Header />} footer={<Footer />}>
              {children}
            </SiteFrame>
          </UserProvider>
        </EditAppointmentProvider>
      </MessagingProvider>
    </AuthProvider>
  );
}
