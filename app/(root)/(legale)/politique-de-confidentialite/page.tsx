/* eslint-disable react/no-unescaped-entities */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité d'Inkera conforme au RGPD.",
};

export default function PolitiqueDeConfidentialite() {
  return (
    <main className="min-h-screen bg-black text-white py-16 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
          <p className="text-gray-400">Dernière mise à jour : 14 avril 2026</p>
        </header>

        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p className="text-gray-300">
            Cette politique explique comment Inkera collecte, utilise et protège
            les données personnelles des utilisateurs.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">2. Données collectées</h2>
          <ul className="list-disc ml-6 text-gray-300">
            <li>Nom et prénom</li>
            <li>Email</li>
            <li>Numéro de téléphone (facultatif)</li>
            <li>Informations liées aux rendez-vous</li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            3. Finalité du traitement
          </h2>
          <ul className="list-disc ml-6 text-gray-300">
            <li>Gestion des rendez-vous</li>
            <li>Communication avec les salons</li>
            <li>Amélioration du service</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            4. Destinataires des données
          </h2>
          <p className="text-gray-300">
            Les données sont accessibles uniquement à Inkera et au salon
            concerné par la demande.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            5. Durée de conservation
          </h2>
          <p className="text-gray-300">
            Les données sont conservées pendant une durée maximale de 3 ans,
            sauf demande de suppression.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            6. Sécurité des données
          </h2>
          <p className="text-gray-300">
            Inkera met en œuvre des mesures techniques pour protéger vos
            informations (HTTPS, accès restreints, etc.).
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">7. Vos droits</h2>
          <p className="text-gray-300">
            Conformément au RGPD, vous pouvez demander l'accès, la modification
            ou la suppression de vos données.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold mb-2">8. Cookies</h2>
          <p className="text-gray-300">
            Le site utilise uniquement des cookies techniques et de mesure
            d’audience anonymes.
          </p>
        </section>

        {/* 🔥 GOOGLE OAUTH */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            9. Données collectées via Google
          </h2>
          <p className="text-gray-300">
            Lors de l’utilisation de la connexion Google, Inkera collecte
            uniquement votre adresse email et votre nom afin de créer et gérer
            votre compte. Ces données ne sont ni vendues ni partagées.
          </p>
        </section>

        {/* 🔐 RESPONSABLE */}
        <section>
          <h2 className="text-xl font-semibold mb-2">
            10. Responsable du traitement
          </h2>
          <p className="text-gray-300">Inkera – contact@theinkera.com</p>
        </section>

        {/* ⚖️ BASE LEGALE */}
        <section>
          <h2 className="text-xl font-semibold mb-2">11. Base légale</h2>
          <p className="text-gray-300">
            Le traitement des données repose sur votre consentement lors de
            l’utilisation du service.
          </p>
        </section>

        {/* 🏢 HEBERGEMENT */}
        <section>
          <h2 className="text-xl font-semibold mb-2">12. Hébergement</h2>
          <p className="text-gray-300">
            Les données sont hébergées sur des serveurs sécurisés.
          </p>
        </section>

        {/* 🏛️ CNIL */}
        <section>
          <h2 className="text-xl font-semibold mb-2">13. Réclamation</h2>
          <p className="text-gray-300">
            Vous pouvez introduire une réclamation auprès de la CNIL
            (www.cnil.fr).
          </p>
        </section>

        {/* CONTACT */}
        <section>
          <h2 className="text-xl font-semibold mb-2">14. Contact</h2>
          <p className="text-gray-300">
            Pour toute demande : <strong>contact@theinkera.com</strong>
          </p>
        </section>
      </div>
    </main>
  );
}
