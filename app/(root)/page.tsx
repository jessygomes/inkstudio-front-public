/* eslint-disable react/no-unescaped-entities */
import { FaArrowDown } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-[100vh] bg-noir-700 flex items-center justify-center relative overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/bgsol.png')",
            backgroundSize: "cover",
          }}
        ></div>

        {/* Overlay moderne */}
        <div className="absolute inset-0 bg-gradient-to-b from-noir-700/60 via-noir-700/40 to-noir-700/80"></div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Badge moderne */}
            <div className="inline-flex items-center gap-2 bg-tertiary-500/20 border border-tertiary-400/30 rounded-full px-4 py-2 backdrop-blur-sm">
              <span className="w-2 h-2 bg-tertiary-400 rounded-full animate-pulse"></span>
              <span className="text-tertiary-400 font-one text-base lg:text-xs font-semibold">
                INKSTUDIO
              </span>
            </div>

            {/* Titre principal */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase font-two tracking-wide leading-tight">
              <span className="block mb-1">Trouvez votre</span>
              <span className="block bg-gradient-to-r from-tertiary-400 to-tertiary-500 bg-clip-text text-transparent">
                salon de tatouage
              </span>
              <span className="block">idéal</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg sm:text-xl text-white/80 font-one leading-relaxed max-w-2xl mx-auto">
              Trouvez facilement le salon de tatouage qui vous convient proche
              de chez vous.
              <span className="text-tertiary-400 font-semibold block mt-2">
                Explorez les portfolios des artistes et prenez rendez-vous en
                ligne.
              </span>
            </p>

            {/* Statistiques rapides */}
            {/* <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  100+
                </div>
                <div className="text-sm text-white/80 font-one">
                  Salons partenaires
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  24/7
                </div>
                <div className="text-sm text-white/80 font-one">
                  Réservation en ligne
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-xl font-bold text-tertiary-400 font-two">
                  FR
                </div>
                <div className="text-sm text-white/80 font-one">
                  Partout en France
                </div>
              </div>
            </div> */}

            {/* CTA d'exploration */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="text-white/60 font-one text-md">
                Découvrez nos salons
              </div>
              <FaArrowDown
                size={24}
                className="text-tertiary-400 animate-bounce"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation des features */}
      <section className="bg-gradient-to-b from-noir-700 to-noir-700 py-16">
        <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-two mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-white/70 font-one text-lg max-w-2xl mx-auto">
              Trouvez votre salon idéal en quelques clics grâce à notre
              plateforme intuitive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card Recherche */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  1. Recherchez
                </h3>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Parcourez les salons près de chez vous et filtrez par style de
                  tatouage
                </p>
              </div>
            </div>

            {/* Card Découverte */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-lg font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  2. Explorez
                </h3>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Découvrez les portfolios des artistes et leurs créations
                  uniques
                </p>
              </div>
            </div>

            {/* Card Réservation */}
            <div className="bg-gradient-to-br from-noir-600/50 to-noir-800/50 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-tertiary-400/30 transition-all duration-300 group">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-tertiary-500/20 to-tertiary-600/20 rounded-2xl flex items-center justify-center group-hover:from-tertiary-500/40 group-hover:to-tertiary-600/40 transition-all duration-300">
                  <span className="text-2xl">📅</span>
                </div>
                <h3 className="text-lg font-bold text-white font-two group-hover:text-tertiary-400 transition-colors">
                  3. Réservez
                </h3>
                <p className="text-white/70 font-one text-sm leading-relaxed">
                  Prenez rendez-vous directement en ligne avec l'artiste de
                  votre choix
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section détaillée */}
      <div className="bg-gradient-to-b from-noir-700 to-noir-500">
        <div className="relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-20 bg-gradient-to-b from-tertiary-400 to-transparent animate-pulse"></div>
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">🖤</span>
                    <h2 className="text-3xl font-bold text-white font-two">
                      Une vitrine moderne pour les salons de tatouage
                    </h2>
                  </div>
                  <p className="text-white/80 font-one text-lg leading-relaxed">
                    InkStudio est un espace en ligne où les salons de tatouage
                    et de piercing présentent leur univers, leurs artistes et
                    leurs réalisations. Chaque page est une vitrine unique,
                    pensée pour mettre en valeur le travail de chaque
                    professionnel.
                  </p>

                  <div className="bg-gradient-to-br from-tertiary-500/10 to-tertiary-600/5 border border-tertiary-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">💡</span>
                      <h3 className="text-tertiary-300 font-semibold font-two">
                        Ce que vous trouverez ici :
                      </h3>
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-tertiary-400 mt-1">✓</span>
                        <span className="text-white/90 font-one">
                          Des salons professionnels et passionnés
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-tertiary-400 mt-1">✓</span>
                        <span className="text-white/90 font-one">
                          Des portfolios illustrant chaque style et chaque
                          artiste
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-tertiary-400 mt-1">✓</span>
                        <span className="text-white/90 font-one">
                          Des informations claires sur les services et contacts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border border-white/20 backdrop-blur-sm">
                    <div className="text-6xl text-center mb-6">✨</div>
                    <h3 className="text-xl font-bold text-white font-two text-center mb-4">
                      Découvrez les salons partenaires
                    </h3>
                    <p className="text-white/70 font-one text-center mb-6">
                      Parcourez les profils publics des salons inscrits et
                      plongez dans leurs univers artistiques. Bientôt, un
                      annuaire complet permettra de rechercher par ville ou par
                      style.
                    </p>
                    <div className="text-center">
                      <Link
                        href="/trouver-un-salon"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-tertiary-500/25 hover:shadow-tertiary-500/40 transform hover:scale-105"
                      >
                        Découvrir les salons
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Section finale CTA */}
      <section className="bg-gradient-to-t from-noir-700 to-noir-500 py-20">
        <div className="container mx-auto px-4 sm:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-4xl">🌟</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white font-two">
                Prêt à trouver votre artiste ?
              </h2>
            </div>
            <p className="text-xl text-white/80 font-one leading-relaxed">
              Rejoignez des milliers de personnes qui ont trouvé leur salon
              idéal sur InkStudio.
              <span className="text-tertiary-400 font-semibold block mt-2">
                Votre prochain chef-d'œuvre commence ici.
              </span>
            </p>

            <div className="bg-gradient-to-br from-tertiary-500/15 to-tertiary-600/10 border border-tertiary-500/40 rounded-3xl p-8 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/trouver-un-salon"
                  className="bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white font-one font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Trouver un salon
                </Link>
                <Link
                  href="/en-savoir-plus"
                  className="border border-white/20 text-white hover:bg-white/10 font-one font-semibold px-8 py-4 rounded-2xl transition-all duration-300"
                >
                  En savoir plus
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
