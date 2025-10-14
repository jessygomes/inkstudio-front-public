import * as z from "zod";

// compare "HH:mm"
const hhmmToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const appointmentRequestSchema = z.object({
  prestation: z.enum(["TATTOO", "PROJET", "RETOUCHE", "PIERCING"]),
  tatoueurId: z.string().optional(), // préférence éventuelle
  visio: z.boolean().optional(), // pour les projets

  availability: z
    .object({
      date: z.string().min(1, "Choisis une date"),
      from: z.string().min(1, "Heure de début requise"),
      to: z.string().min(1, "Heure de fin requise"),
      alt: z
        .object({
          date: z.string().optional(),
          from: z.string().optional(),
          to: z.string().optional(),
        })
        .optional(),
    })
    .superRefine((val, ctx) => {
      if (val.from && val.to) {
        if (hhmmToMinutes(val.to) <= hhmmToMinutes(val.from)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "L’heure de fin doit être après l’heure de début",
            path: ["to"],
          });
        }
      }
      if (val.alt) {
        const hasAny = !!val.alt.date || !!val.alt.from || !!val.alt.to;
        const hasAll = !!val.alt.date && !!val.alt.from && !!val.alt.to;
        if (hasAny && !hasAll) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Renseigne les 3 champs (date, début et fin) pour l’alternative",
            path: ["alt"],
          });
        }
      }
    }),

  client: z.object({
    firstName: z.string().min(1, "Prénom requis"),
    lastName: z.string().min(1, "Nom requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
  }),

  details: z.object({
    description: z.string().optional(),
    zone: z.string().optional(),
    size: z.string().optional(),
    colorStyle: z.string().optional(),
    sketch: z.string().optional(),
    reference: z.string().optional(),
  }),

  message: z.string().optional(),
});
