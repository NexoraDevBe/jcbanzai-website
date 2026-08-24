import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { api } from '~/utils/query';
import type { Members } from '~/utils/query/members/get';
import { QueryKey } from '~/utils/query/queryKey.enum';

export const useMemberMutation = () => {
  const queryClient = useQueryClient();

  const { mutate: upsertMember, ...upsert } = useMutation({
    mutationFn: api.members.upsert,
    onSuccess: (data, variables) => {
      if (!data) return;
      queryClient.setQueryData([QueryKey.MEMBERS], (old: Members | undefined) => {
        if (!old) return [data];

        const isUpdate = Boolean(variables.id);

        return isUpdate
          ? old.map((member) => (member.id === data.id ? data : member))
          : [...old, data];
      });
    },
  });

  const { mutate: removeMember, ...remove } = useMutation({
    mutationFn: api.members.remove,
    onSuccess: (id) => {
      if (!id) return;

      queryClient.setQueryData([QueryKey.MEMBERS], (old: Members | undefined) => {
        if (!old) return;
        return old.filter((member) => member.id !== id);
      });
    },
  });

  return { upsertMember, upsert, removeMember, remove };
};
