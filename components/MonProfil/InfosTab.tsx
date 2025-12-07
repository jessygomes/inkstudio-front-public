/* eslint-disable react/no-unescaped-entities */
"use client";

import { User } from "@/lib/type";
import React from "react";
import {
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

type Props = {
  user: User;
};

export default function InfosTab({ user }: Props) {
  return (
    <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Header modernisé */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-white font-one font-semibold text-lg sm:text-xl mb-1">
            Mes informations
          </h3>
          <p className="text-white/60 font-one text-xs">
            Profil et coordonnées
          </p>
        </div>
        <div className="w-10 h-10 bg-tertiary-500/20 rounded-xl flex items-center justify-center">
          <FaUser className="w-5 h-5 text-tertiary-400" />
        </div>
      </div>

      {/* Grille d'informations modernisée */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card Pseudo */}
        <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-tertiary-500/20 flex items-center justify-center">
              <FaUser className="w-3 h-3 text-tertiary-400" />
            </div>
            <label className="text-white/70 font-one text-xs uppercase tracking-wider">
              Pseudo
            </label>
          </div>
          <p className="text-white font-one text-sm">
            {user.clientProfile?.pseudo || "Non renseigné"}
          </p>
        </div>

        {/* Card Prénom */}
        <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300">
          <label className="text-white/70 font-one text-xs uppercase tracking-wider block mb-2">
            Prénom
          </label>
          <p className="text-white font-one text-sm">{user.firstName}</p>
        </div>

        {/* Card Nom */}
        <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300">
          <label className="text-white/70 font-one text-xs uppercase tracking-wider block mb-2">
            Nom
          </label>
          <p className="text-white font-one text-sm">{user.lastName}</p>
        </div>

        {/* Card Email */}
        <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <FaEnvelope className="w-3 h-3 text-emerald-400" />
            </div>
            <label className="text-white/70 font-one text-xs uppercase tracking-wider">
              Email
            </label>
          </div>
          <p className="text-white font-one text-sm truncate">{user.email}</p>
        </div>

        {/* Card Téléphone */}
        <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <FaPhone className="w-3 h-3 text-amber-400" />
            </div>
            <label className="text-white/70 font-one text-xs uppercase tracking-wider">
              Téléphone
            </label>
          </div>
          <p className="text-white font-one text-sm">{user.phone}</p>
        </div>

        {/* Card Date de naissance */}
        <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <FaBirthdayCake className="w-3 h-3 text-pink-400" />
            </div>
            <label className="text-white/70 font-one text-xs uppercase tracking-wider">
              Date de naissance
            </label>
          </div>
          <p className="text-white font-one text-sm">
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

        {/* Card Ville */}
        <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FaMapMarkerAlt className="w-3 h-3 text-purple-400" />
            </div>
            <label className="text-white/70 font-one text-xs uppercase tracking-wider">
              Ville
            </label>
          </div>
          <p className="text-white font-one text-sm">
            {user.clientProfile?.city || "Non renseignée"}
          </p>
        </div>

        {/* Card Code postal */}
        {user.clientProfile?.postalCode && (
          <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300">
            <label className="text-white/70 font-one text-xs uppercase tracking-wider block mb-2">
              Code postal
            </label>
            <p className="text-white font-one text-sm">
              {user.clientProfile.postalCode}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
