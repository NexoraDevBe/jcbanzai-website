import type { Belt } from '~/utils/enums/tehcniques';

export type Planning = {
  id: number;
  name: string;
  belt: Belt;
};

export type MemberResponse = Omit<Planning, 'leeftijd'>;

export type Plannings = Planning[];

export const get = async (): Promise<Members> => {
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
