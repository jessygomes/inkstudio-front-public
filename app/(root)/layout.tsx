import Footer from "@/components/Shared/Footer";
import Header from "@/components/Shared/Header";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="absolute top-0 left-0 w-full">
        <Header />
      </div>
      {children}
      <Footer />
    </div>
  );
}
