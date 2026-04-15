/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { AuthProvider } from "@/components/Auth/AuthProvider";
import CookieBanner from "@/components/Analytics/CookieBanner";
import { CookieConsentProvider } from "@/components/Analytics/CookieConsentContext";
import GoogleAnalytics from "@/components/Analytics/GoogleAnalytics";
import { EditAppointmentProvider } from "@/components/Context/EditAppointmentContext";
import { MessagingProvider } from "@/components/Context/MessageProvider";
import { UserProvider } from "@/components/Context/UserContext";
import { Toaster } from "@/components/Shared/Sonner";
import Footer from "@/components/Shared/Footer";
import Header from "@/components/Shared/Header";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let user = {
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    image: "",
    birthDate: "",
    role: "",
    isAuthenticated: false,
    clientProfile: null,
  };

  if (session?.user) {
    user = {
      id: session.user.id || "",
      firstName: session.user.firstName || "",
      lastName: session.user.lastName || "",
      email: session.user.email || "",
      phone: session.user.phone || "",
      image: session.user.image || "",
      birthDate: "",
      role: session.user.role || "client",
      isAuthenticated: true,
      clientProfile: (session.user as any).clientProfile || null,
    };
  }

  return (
    <AuthProvider>
      <MessagingProvider>
        <EditAppointmentProvider>
          <CookieConsentProvider>
            <GoogleAnalytics measurementId="G-YG3WKCC1JL" />
            <Toaster />
            <CookieBanner />
            <UserProvider user={user}>
              <div>
                <div className="fixed top-0 left-0 w-full z-30 ">
                  <Header />
                </div>
                {children}
                <Footer />
              </div>
            </UserProvider>
          </CookieConsentProvider>
        </EditAppointmentProvider>
      </MessagingProvider>
    </AuthProvider>
  );
}
