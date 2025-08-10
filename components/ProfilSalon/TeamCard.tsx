import Image from "next/image";

export function TeamCard({
  name,
  img,
  description,
  instagram,
  phone, // on le garde dans les props pour compatibilité, mais on ne l'affiche plus
}: {
  name: string;
  img?: string | null;
  description?: string | null;
  instagram?: string | null;
  phone?: string | null;
}) {
  const instaUrl = instagram
    ? instagram.startsWith("http")
      ? instagram
      : `https://instagram.com/${instagram.replace(/^@/, "")}`
    : null;

  return (
    <li className="group relative rounded-xl border border-white/10 bg-white/[0.06] p-5 hover:bg-white/[0.1] transition-colors">
      {/* Header */}
      <div className="flex items-center gap-5">
        {/* Avatar + anneau dégradé (plus grand) */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-xl" />
          <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-xl overflow-hidden ring-1 ring-white/15 bg-white/10">
            {img ? (
              <Image
                src={img}
                alt={name}
                fill
                sizes="112px"
                className="object-cover"
                priority={false}
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-white/40 text-xs">
                N/A
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-white/95 font-var(--font-one) text-sm leading-6">
            {name}
          </p>

          {/* Meta: uniquement Instagram */}
          {instaUrl && (
            <a
              href={instaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 underline-offset-2 hover:underline"
              title="Instagram"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden
                className="opacity-85 text-white hover:text-white/50 transition-colors"
              >
                <path
                  fill="currentColor"
                  d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 2.2a2.8 2.8 0 1 0 0 5.6a2.8 2.8 0 0 0 0-5.6ZM18.5 6a1 1 0 1 1 0 2a1 1 0 0 1 0-2Z"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Description (entière) */}
      {description && (
        <p className="mt-4 text-white/80 font-var(--font-one) text-xs leading-7 whitespace-pre-line">
          {description}
        </p>
      )}

      {/* Footer: uniquement un bouton/lien Instagram */}
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
        <div className="text-xs text-white/50 font-var(--font-one)">
          Profil artiste
        </div>
        {/* {instaUrl && (
          <a
            href={instaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer px-3 py-1.5 rounded-lg text-[11px] font-var(--font-one) bg-white/10 hover:bg-white/20 text-white border border-white/15 transition"
          >
            Voir sur Instagram
          </a>
        )} */}
      </div>
    </li>
  );
}
