/** Ce que le fil affiche : photos de portfolio et flashs mélangés (all), ou l'un des deux seulement. */
export type InspirationType = "all" | "photos" | "flash";

export type InspirationSelection = {
  type: InspirationType;
  city: string;
  pieceSize: string[];
  category: string[];
  style: string[];
  hashtag: string[];
};

export const EMPTY_INSPIRATION_SELECTION: InspirationSelection = {
  type: "all",
  city: "",
  pieceSize: [],
  category: [],
  style: [],
  hashtag: [],
};

export const INSPIRATION_TYPE_OPTIONS = [
  { value: "photos", label: "Photos" },
  { value: "flash", label: "Flashs" },
] as const;

export const PIECE_SIZE_OPTIONS = [
  { value: "SMALL", label: "Petite" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "LARGE", label: "Grande" },
] as const;

const splitCsv = (value?: string | null) =>
  Array.from(
    new Set(
      (value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );

export const normalizeHashtag = (value: string) =>
  value.trim().replace(/^#+/, "").toLowerCase();

// Les hashtags peuvent être saisis séparés par des espaces ou des virgules
export const parseHashtagInput = (value: string) =>
  Array.from(
    new Set(value.split(/[\s,]+/).map(normalizeHashtag).filter(Boolean)),
  );

export const parseInspirationFilters = (
  get: (key: string) => string | null | undefined,
): InspirationSelection => {
  const validSizes: string[] = PIECE_SIZE_OPTIONS.map((option) => option.value);

  const rawType = (get("type") || "").trim().toLowerCase();
  const type: InspirationType = rawType === "flash" || rawType === "photos" ? rawType : "all";
  // Taille de pièce, catégories et hashtags n'existent que sur les photos : ignorés en mode « flashs ».
  const photoOnly = type !== "flash";

  return {
    type,
    city: (get("city") || "").trim().toUpperCase(),
    pieceSize: photoOnly
      ? splitCsv(get("size"))
          .map((value) => value.toUpperCase())
          .filter((value) => validSizes.includes(value))
      : [],
    category: photoOnly ? splitCsv(get("category")) : [],
    style: splitCsv(get("style")),
    hashtag: photoOnly ? splitCsv(get("hashtag")).map(normalizeHashtag).filter(Boolean) : [],
  };
};

export const buildInspirationQuery = (selection: InspirationSelection) => {
  const params = new URLSearchParams();
  if (selection.type !== "all") params.set("type", selection.type);
  if (selection.city) params.set("city", selection.city);
  if (selection.pieceSize.length) params.set("size", selection.pieceSize.join(","));
  if (selection.category.length) params.set("category", selection.category.join(","));
  if (selection.style.length) params.set("style", selection.style.join(","));
  if (selection.hashtag.length) params.set("hashtag", selection.hashtag.join(","));
  return params.toString();
};

export const hasActiveInspirationFilters = (selection: InspirationSelection) =>
  Boolean(
    selection.type !== "all" ||
      selection.city ||
      selection.pieceSize.length ||
      selection.category.length ||
      selection.style.length ||
      selection.hashtag.length,
  );
