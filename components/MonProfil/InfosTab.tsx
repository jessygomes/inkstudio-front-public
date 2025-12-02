/* eslint-disable react/no-unescaped-entities */
"use client";

import { User } from "@/lib/type";
import React from "react";
import {
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaMapMarkerAlt,
} from "react-icons/fa";

type Props = {
  user: User;
  // appointmentsCount: number;
  // favoritesCount: number;
};

export default function InfosTab({
  user,
}: // appointmentsCount,
// favoritesCount,
Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informations personnelles */}
      <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-one font-semibold text-lg">
            Informations personnelles
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-white/70 font-one text-sm mb-1 block">
                Pseudo
              </label>
              <p className="text-white font-one">
                {user.clientProfile?.pseudo || "Non renseigné"}
              </p>
            </div>
            <div>
              <label className="text-white/70 font-one text-sm mb-1 block">
                Prénom
              </label>
              <p className="text-white font-one">{user.firstName}</p>
            </div>
            <div>
              <label className="text-white/70 font-one text-sm mb-1 block">
                Nom
              </label>
              <p className="text-white font-one">{user.lastName}</p>
            </div>
          </div>

          <div>
            <label className="text-white/70 font-one text-sm mb-1 flex items-center gap-2">
              <FaEnvelope className="w-3 h-3" />
              Email
            </label>
            <p className="text-white font-one">{user.email}</p>
          </div>

          <div>
            <label className="text-white/70 font-one text-sm mb-1 flex items-center gap-2">
              <FaPhone className="w-3 h-3" />
              Téléphone
            </label>
            <p className="text-white font-one">{user.phone}</p>
          </div>

          <div>
            <label className="text-white/70 font-one text-sm mb-1 flex items-center gap-2">
              <FaBirthdayCake className="w-3 h-3" />
              Date de naissance
            </label>
            <p className="text-white font-one">
              {user.clientProfile?.birthDate
                ? new Date(user.clientProfile.birthDate).toLocaleDateString(
                    "fr-FR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "Non renseignée"}
            </p>
          </div>

          <div>
            <label className="text-white/70 font-one text-sm mb-1 flex items-center gap-2">
              <FaMapMarkerAlt className="w-3 h-3" />
              Ville
            </label>
            <p className="text-white font-one">
              {user.clientProfile?.city || "Non renseignée"}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
        <h3 className="text-white font-one font-semibold text-lg mb-6">
          Mes statistiques
        </h3>

        {/* <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-tertiary-400 font-two mb-1">
              {appointmentsCount}
            </div>
            <div className="text-white/70 font-one text-sm">
              Rendez-vous pris
            </div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-tertiary-400 font-two mb-1">
              {favoritesCount}
            </div>
            <div className="text-white/70 font-one text-sm">Salons favoris</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-tertiary-400 font-two mb-1">
              {user.clientProfile?.birthDate
                ? new Date().getFullYear() -
                  new Date(user.clientProfile.birthDate).getFullYear()
                : "?"}
            </div>
            <div className="text-white/70 font-one text-sm">
              Années d'ancienneté
            </div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="text-2xl font-bold text-tertiary-400 font-two mb-1">
              {new Date().getFullYear() -
                new Date(user.createdAt).getFullYear()}
            </div>
            <div className="text-white/70 font-one text-sm">
              Années d'ancienneté
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
