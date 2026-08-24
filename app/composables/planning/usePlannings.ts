import { useQuery } from '@tanstack/vue-query';
import { api } from '~/utils/query';
import type { Plannings } from '~/utils/query/plannings/get';
import { QueryKey } from '~/utils/query/queryKey.enum';

export const usePlannings = () => {
  const { data, ...rest } = useQuery<Plannings, Error, Plannings, QueryKey[]>({
    queryKey: [QueryKey.PLANNINGS],
    queryFn: () =>
      api.plannings.get({
        from: '2026-01-01',
        to: '2026-12-31',
      }),
  });

  return { data, ...rest };
};
