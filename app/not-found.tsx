import BtnBack from "@/components/Shared/BtnBack";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col justify-center items-center px-4">
      <div className="max-w-2xl w-full text-center py-20">
        {/* Error code avec style du site */}
        <div className="relative mb-12">
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-tertiary-500 to-tertiary-400 drop-shadow-lg">
            404
          </h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-bold text-accent-500 opacity-10 blur-sm">
            404
          </div>
        </div>

        {/* Message d'erreur */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Page Introuvable
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-lg mx-auto font-one">
            Cette page n&apos;existe pas ou a été déplacée.
            <br />
            Retournez à l&apos;accueil pour découvrir notre univers.
          </p>
        </div>

        {/* Boutons d'action avec design du site */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <BtnBack />
        </div>

        {/* Navigation suggestions avec design cohérent */}
      </div>
    </div>
  );
}
