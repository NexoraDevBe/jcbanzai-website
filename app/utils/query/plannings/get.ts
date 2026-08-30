import z from 'zod';
import { PlanningType, PlanningTypeOrder } from '~/utils/enums/planning';

export type Planning = {
  id: number;
  day: string;
  weekday: string;
  type: PlanningType;
  beschikbaar: string[];
  planning: string[];
  updated_at: string;
  created_at: string;
};

export type PlanningResponse = Omit<Planning, 'weekday'>;

export type Plannings = Planning[];

export const getPlanningSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export type GetPlanning = z.infer<typeof getPlanningSchema>;

export const get = async (body: GetPlanning): Promise<Plannings> => {
  const supabase = useSupabase();

  const parsed = getPlanningSchema.parse(body);

  const { data } = await supabase
    .from('Planning')
    .select('*')
    // .order('day', { ascending: true })
    // .order('type', { ascending: false })
    .gte('day', parsed.from)
    .lt('day', parsed.to)
    .overrideTypes<PlanningResponse[], { merge: false }>();

  const sorted = computed(() =>
    (data ?? []).sort((a, b) => {
      const dayComparison = a.day.localeCompare(b.day);

      if (dayComparison !== 0) {
        return dayComparison;
      }

      return PlanningTypeOrder.indexOf(a.type) - PlanningTypeOrder.indexOf(b.type);
    }),
  );

  return sorted.value.map((planning) => ({
    ...planning,
    weekday: formatDateToWeekDay(planning.day),
  }));
};
