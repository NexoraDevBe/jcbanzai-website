import { z } from 'zod';
import { Geslacht, Graad } from '~/utils/enums/members';
import type { Member, Members } from './get';

export const baseMemberSchema = z.object({
  opvolging: z.string().optional(),
  vergunning: z.number().optional().nullable(),
  voornaam: z.string().min(1),
  naam: z.string().min(1),
  straat: z.string().min(1),
  postcode: z.string().min(1),
  gemeente: z.string().min(1),
  gsm: z.string().min(1),
  telefoon: z.string().optional(),
  emails: z.array(z.email()).min(1),
  geslacht: z.enum(Geslacht),
  geboorte_datum: z.iso.date(),
  nationaliteit: z.string(),
  graad: z.enum(Graad).optional(),
  actief: z.boolean().optional(),
  vergunning_geldig_tot: z.iso.date().optional().nullable(),
  wedstrijd_training: z.string().optional().nullable(),
  dojos: z.array(z.string()).optional(),
  lidgeld_opmerkingen: z.string().optional().nullable(),
  gordel_behaald_op: z.iso.date().optional().nullable(),
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
