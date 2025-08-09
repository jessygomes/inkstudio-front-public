import { FaArrowDown } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Ajoutez ici d'autres éléments si nécessaire */}
      <section className="h-screen bg-noir-700 flex items-center justify-center">
        <div
          className="h-screen w-full bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: "url('/images/bgsol.png')",
            backgroundSize: "cover",
          }}
        >
          <div className="flex flex-col justify-center items-center gap-2">
            <h2 className="text-white font-two">INKSTUDIO</h2>
            <h1 className="text-2xl sm:text-3xl font-bold text-white uppercase font-two tracking-wide text-center">
              Trouvez votre salon de tatouage
            </h1>
            <p className="text-center text-white/70 text-md font-one w-3/4">
              Trouvez facilement le salon de tatouage qui vous convient proche
              de chez vous. Explorez les portfolios des artistes, consultez les
              avis et prenez rendez-vous en ligne.
            </p>
            <FaArrowDown
              size={35}
              className="text-tertiary-400 animate-pulse"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
