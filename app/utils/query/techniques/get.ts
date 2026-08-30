import type { Belt } from '~/utils/enums/tehcniques';

export type Technique = {
  id: number;
  name: string;
  belt: Belt;
};

export type MemberResponse = Omit<Technique, 'leeftijd'>;

export type Plannings = Technique[];

export const get = async (): Promise<Technique> => {
  const supabase = useSupabase();

  const { data } = await supabase
    .from('Techniques')
    .select('*')
    .order('created_at', { ascending: false })
    .overrideTypes<MemberResponse[], { merge: false }>();

  return (data ?? []).map((member) => ({
    ...member,
    postcode: String(member.postcode),
    leeftijd: calculateAge(member.geboorte_datum),
  }));
};
