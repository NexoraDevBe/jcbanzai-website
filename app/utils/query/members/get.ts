import type { Geslacht, Graad } from '~/utils/enums/members';

export type Member = {
  id: number;
  opvolging: string;
  vergunning: number;
  voornaam: string;
  naam: string;
  straat: string;
  postcode: string;
  gemeente: string;
  gsm: string;
  telefoon: string;
  emails: string[];
  geslacht: Geslacht;
  geboorte_datum: string;
  leeftijd: number;
  nationaliteit: string;
  graad: Graad;
  actief: boolean;
  vergunning_geldig_tot: string;
  wedstrijd_training: string;
  dojos: string[];
  lidgeld_opmerkingen: string;
  gordel_behaald_op: string;
  updated_at: string;
  created_at: string;
};

export type MemberResponse = Omit<Member, 'leeftijd'>;

export type Members = Member[];

export const get = async (): Promise<Members> => {
  const supabase = useSupabase();

  const { data } = await supabase
    .from('Members')
    .select('*')
    .order('created_at', { ascending: false })
    .overrideTypes<MemberResponse[], { merge: false }>();

  // const { data } = await buildQuery<Member, typeof query>(query, {
  //   sort: { column: 'created_at', ascending: false },
  // }).overrideTypes<MemberResponse[], { merge: false }>();

  return (data ?? []).map((member) => ({
    ...member,
    postcode: String(member.postcode),
    leeftijd: calculateAge(member.geboorte_datum),
  }));
};
