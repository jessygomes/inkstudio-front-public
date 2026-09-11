import type { User } from "@/lib/type";
import { Contact, Pencil, UserRound } from "lucide-react";
import AppButton from "@/components/Shared/AppButton";

type Props = { user: User };

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  const display = value?.trim();
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-baseline gap-3 py-2.5">
      <dt className="text-xs leading-5 text-white/50">{label}</dt>
      <dd className={`min-w-0 break-words text-sm leading-5 ${display ? "text-white/85" : "text-white/35"}`}>
        {display || "Non renseigné"}
      </dd>
    </div>
  );
}

export default function InfosTab({ user }: Props) {
  const rawBirthDate = user.clientProfile?.birthDate;
  const birthDate = rawBirthDate && !Number.isNaN(Date.parse(rawBirthDate))
    ? new Date(rawBirthDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : null;
  const identity = [
    { label: "Pseudo", value: user.clientProfile?.pseudo },
    { label: "Prénom", value: user.firstName },
    { label: "Nom", value: user.lastName },
    { label: "Date de naissance", value: birthDate },
  ];
  const contact = [
    { label: "Email", value: user.email },
    { label: "Téléphone", value: user.phone },
    { label: "Ville", value: user.clientProfile?.city },
    { label: "Code postal", value: user.clientProfile?.postalCode },
  ];

  return (
    <div className="space-y-4 font-one">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl text-white">Mes informations</h3>
          <p className="mt-1 text-xs text-white/50">Votre identité et vos coordonnées en un coup d’œil.</p>
        </div>
        <AppButton href="/mon-profil/modifier" variant="secondary" icon={<Pencil size={14} aria-hidden="true" />} className="min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-400">
          Modifier
        </AppButton>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {[
          { title: "Mon identité", Icon: UserRound, items: identity },
          { title: "Mes coordonnées", Icon: Contact, items: contact },
        ].map(({ title, Icon, items }) => (
          <section key={title} aria-label={title} className="min-w-0 rounded-2xl border border-white/10 bg-noir-500 px-4 py-3 sm:px-5">
            <div className="mb-1 flex items-center gap-2 border-b border-white/8 pb-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-tertiary-400/10 text-tertiary-400"><Icon size={15} aria-hidden="true" /></span>
              <h4 className="text-sm font-medium text-white/90">{title}</h4>
            </div>
            <dl className="divide-y divide-white/5">
              {items.map((item) => <InfoRow key={item.label} {...item} />)}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
