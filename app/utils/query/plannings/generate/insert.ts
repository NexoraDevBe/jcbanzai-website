import z from 'zod';
import { PlanningTypeOrder, WeekSchedule } from '~/utils/enums/planning';
import type { PlanningResponse, Plannings } from '../get';

export const insertPlanningGenerateSchema = z.object({
  year: z.number(),
  month: z.number(),
});

export type InsertPlanningGenerate = z.infer<typeof insertPlanningGenerateSchema>;

export const insert = async (body: InsertPlanningGenerate): Promise<number> => {
  const supabase = useSupabase();

  const parsed = insertPlanningGenerateSchema.parse(body);

  const { data, error } = await supabase.rpc('generate_month_planning', {
    p_year: parsed.year,
    p_month: parsed.month,
    p_week_schedule: WeekSchedule,
  });

  if (error) {
    throw error;
  }

  return data;
};
