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
  const infoItems = [
    {
      label: "Pseudo",
      value: user.clientProfile?.pseudo || "Non renseigné",
      icon: <FaUser className="h-3 w-3 text-tertiary-400" />,
      iconClassName: "bg-tertiary-500/15",
    },
    {
      label: "Prénom",
      value: user.firstName || "Non renseigné",
      icon: <FaUser className="h-3 w-3 text-white/70" />,
      iconClassName: "bg-white/10",
    },
    {
      label: "Nom",
      value: user.lastName || "Non renseigné",
      icon: <FaUser className="h-3 w-3 text-white/70" />,
      iconClassName: "bg-white/10",
    },
    {
      label: "Email",
      value: user.email || "Non renseigné",
      icon: <FaEnvelope className="h-3 w-3 text-emerald-400" />,
      iconClassName: "bg-emerald-500/15",
    },
    {
      label: "Téléphone",
      value: user.phone || "Non renseigné",
      icon: <FaPhone className="h-3 w-3 text-amber-400" />,
      iconClassName: "bg-amber-500/15",
    },
    {
      label: "Date de naissance",
      value: user.clientProfile?.birthDate
        ? new Date(user.clientProfile.birthDate).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Non renseignée",
      icon: <FaBirthdayCake className="h-3 w-3 text-pink-400" />,
      iconClassName: "bg-pink-500/15",
    },
    {
      label: "Ville",
      value: user.clientProfile?.city || "Non renseignée",
      icon: <FaMapMarkerAlt className="h-3 w-3 text-purple-400" />,
      iconClassName: "bg-purple-500/15",
    },
    {
      label: "Code postal",
      value: user.clientProfile?.postalCode || "Non renseigné",
      icon: <FaMapMarkerAlt className="h-3 w-3 text-white/70" />,
      iconClassName: "bg-white/10",
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-linear-to-br from-noir-500/6 to-white/3 p-4 shadow-xl backdrop-blur-lg sm:p-5">
      <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-white font-one sm:text-xl">
            Mes informations
          </h3>
          <p className="text-white/60 font-one text-xs">
            Profil et coordonnées
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-tertiary-500/15 border border-tertiary-500/25">
          <FaUser className="h-4 w-4 text-tertiary-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="group rounded-2xl border border-white/10 bg-white/4 px-3.5 py-3 transition-all duration-300 hover:border-white/20 hover:bg-white/6"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 ${item.iconClassName}`}
              >
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-one">
                  {item.label}
                </p>
                <p className="mt-1 line-clamp-2 wrap-break-word text-sm text-white font-one">
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
