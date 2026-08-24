import { z } from 'zod';
import { Geslacht, Graad } from '~/utils/enums/members';
import type { Member, Members } from './get';

export const baseMemberSchema = z.object({
  opvolging: z.string().optional(),
  vergunning: z
    .number({
      error: 'Vergunning moet een nummer zijn.',
    })
    .optional()
    .nullable(),

  voornaam: z
    .string({
      error: 'Voornaam is verplicht.',
    })
    .min(1, 'Voornaam is verplicht.'),

  naam: z
    .string({
      error: 'Naam is verplicht.',
    })
    .min(1, 'Naam is verplicht.'),

  straat: z
    .string({
      error: 'Straat is verplicht.',
    })
    .min(1, 'Straat is verplicht.'),

  postcode: z
    .string({
      error: 'Postcode is verplicht.',
    })
    .min(1, 'Postcode is verplicht.'),

  gemeente: z
    .string({
      error: 'Gemeente is verplicht.',
    })
    .min(1, 'Gemeente is verplicht.'),

  gsm: z
    .string({
      error: 'Gsm-nummer is verplicht.',
    })
    .min(1, 'Gsm-nummer is verplicht.'),

  telefoon: z.string().optional(),

  emails: z
    .array(z.email('Gelieve een geldig e-mailadres in te vullen.'))
    .min(1, 'Minstens één e-mailadres is verplicht.'),

  geslacht: z.enum(Geslacht, {
    error: 'Gelieve een geldig geslacht te selecteren.',
  }),

  geboorte_datum: z.iso.date({
    error: 'Gelieve een geldige geboortedatum in te vullen.',
  }),

  nationaliteit: z
    .string({
      error: 'Nationaliteit is verplicht.',
    })
    .min(1, 'Nationaliteit is verplicht.'),

  graad: z
    .enum(Graad, {
      error: 'Gelieve een geldige graad te selecteren.',
    })
    .optional(),

  actief: z
    .boolean({
      error: 'Actief moet een ja/nee-waarde zijn.',
    })
    .optional(),

  vergunning_geldig_tot: z.iso
    .date({
      error: 'Gelieve een geldige einddatum van de vergunning in te vullen.',
    })
    .optional()
    .nullable(),

  wedstrijd_training: z.string().optional().nullable(),

  dojos: z
    .array(
      z.string({
        error: 'Elke dojo moet een geldige tekstwaarde zijn.',
      }),
    )
    .optional(),

  lidgeld_opmerkingen: z.string().optional().nullable(),

  gordel_behaald_op: z.iso
    .date({
      error: 'Gelieve een geldige datum voor het behalen van de gordel in te vullen.',
    })
    .optional()
    .nullable(),
});
export const createMemberSchema = baseMemberSchema;
export const updateMemberSchema = baseMemberSchema.extend({ id: z.number() });
export const upsertMemberSchema = baseMemberSchema.extend({ id: z.number().optional() });

export type CreateMember = z.infer<typeof createMemberSchema>;
export type UpdateMember = z.infer<typeof updateMemberSchema>;
export type UpsertMember = z.infer<typeof upsertMemberSchema>;

export async function upsert(body: UpsertMember): Promise<Member | undefined> {
  const supabase = useSupabase();
  const { data: parsed, error } = upsertMemberSchema.safeParse(body);
  if (error) return undefined;

  const { data: result } = await supabase
    .from('Members')
    .upsert(parsed)
    .select('*')
    .eq('id', parsed.id)
    .overrideTypes<Members, { merge: false }>();

  const member = result?.[0];
  if (!member) return undefined;

  return {
    ...member,
    postcode: String(member.postcode),
    leeftijd: calculateAge(member.geboorte_datum),
  };
}
