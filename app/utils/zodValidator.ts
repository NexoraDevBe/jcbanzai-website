import type { ZodType } from 'zod';

export function toTypedSchema<TSchema extends ZodType>(schema: TSchema) {
  return {
    __type: 'VVTypedSchema' as const,
    async parse(value: unknown) {
      const result = await schema.safeParseAsync(value);

      if (result.success) {
        return {
          value: result.data,
          errors: [],
        };
      }

      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        (fieldErrors[path] ??= []).push(issue.message);
      }

      return {
        errors: Object.entries(fieldErrors).map(([path, errors]) => ({
          path,
          errors,
        })),
      };
    },
  };
}
