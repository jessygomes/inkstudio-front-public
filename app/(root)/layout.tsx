import Footer from "@/components/Shared/Footer";
import Header from "@/components/Shared/Header";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="fixed top-0 left-0 w-full z-30 bg-transparent backdrop-blur-2xl">
        <Header />
      </div>
      {children}
      <Footer />
    </div>
  );
}
