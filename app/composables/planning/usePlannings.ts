import { useQuery } from '@tanstack/vue-query';
import { api } from '~/utils/query';
import type { Plannings } from '~/utils/query/plannings/get';
import { QueryKey } from '~/utils/query/queryKey.enum';

export type PlanningParams = {
  from: string | undefined;
  to: string | undefined;
};

export const usePlannings = (params?: PlanningParams) => {
  const { data, ...rest } = useQuery<Plannings, Error, Plannings, QueryKey[]>({
    queryKey: [QueryKey.PLANNINGS],
    queryFn: () =>
      api.plannings.get({ from: params?.from ?? '2026-01-01', to: params?.to ?? '2026-12-31' }),
  });

  const distinctMonthOptions = computed(() => {
    const months = new Map<string, string>();

    for (const item of data.value ?? []) {
      const sortKey = item.day.slice(0, 7);
      if (!months.has(sortKey)) {
        months.set(sortKey, formatDateTo(item.day, 'YM'));
      }
    }

    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }));
  });

  const planningByMonth = computed(() => {
    const map = new Map<string, Plannings>();

    for (const item of data.value ?? []) {
      const month = item.day.slice(0, 7);
      const bucket = map.get(month);
      if (bucket) {
        bucket.push(item);
      } else {
        map.set(month, [item]);
      }
    }

    return map;
  });

  return { data, ...rest, planningByMonth, distinctMonthOptions };
};
