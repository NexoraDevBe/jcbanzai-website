import { useQuery } from '@tanstack/vue-query';
import { api } from '~/utils/query';
import type { Members } from '~/utils/query/members/get';
import { QueryKey } from '~/utils/query/queryKey.enum';

export const useMembers = () => {
  const { data, ...rest } = useQuery<Members, Error, Members, QueryKey[]>({
    queryKey: [QueryKey.MEMBERS],
    queryFn: api.members.get,
  });

  const getMemberByNameAndDate = computed(() => {
    return new Set(
      (data.value ?? []).map(
        (member) => `${member.voornaam}|${member.naam}|${member.geboorte_datum}`,
      ),
    );
  });

  const exists = (voornaam: string, naam: string, geboorteDatum: string) => {
    return getMemberByNameAndDate.value.has(`${voornaam}|${naam}|${geboorteDatum}`);
  };

  return { data, ...rest, exists, getMemberByNameAndDate };
};
