import z from 'zod';

export const removeMemberSchema = z.object({
  id: z.number(),
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;

const remove = async (id: number) => {
  const supabase = useSupabase();
  const { data: parsed, error } = removeMemberSchema.safeParse({ id });
  if (error) return undefined;

  const { success } = await supabase.from('Members').delete().eq('id', parsed.id);

  if (!success) return undefined;
  return parsed.id;
};

export { remove };
