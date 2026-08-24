type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';

export type SortParam<T> = {
  column: keyof T & string;
  ascending?: boolean;
  nullsFirst?: boolean;
};

export type SearchParam<T> = {
  type: 'ilike';
  columns: (keyof T & string)[];
  value: string;
};

export type FilterParam<T> = {
  column: keyof T & string;
  operator?: FilterOperator;
  value: unknown;
};

export interface QueryParams<T> {
  filters?: FilterParam<T>[];
  search?: SearchParam<T>;
  sort?: SortParam<T> | SortParam<T>[];
}

export interface FilterableQuery {
  eq(column: string, value: unknown): this;
  neq(column: string, value: unknown): this;
  gt(column: string, value: unknown): this;
  gte(column: string, value: unknown): this;
  lt(column: string, value: unknown): this;
  lte(column: string, value: unknown): this;
  like(column: string, pattern: string): this;
  ilike(column: string, pattern: string): this;
  in(column: string, values: readonly unknown[]): this;
  or(filters: string, options?: { referencedTable?: string }): this;
  textSearch(
    column: string,
    query: string,
    options?: { type?: 'plain' | 'phrase' | 'websearch'; config?: string },
  ): this;
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this;
}

export const buildQuery = <T extends { id: number | string }, Q extends FilterableQuery>(
  query: Q,
  params: QueryParams<T>,
): Q => {
  let q = query;

  params.filters?.forEach(({ column, operator = 'eq', value }) => {
    if (value === undefined || value === null) return;

    switch (operator) {
      case 'eq':
        q = q.eq(column, value);
        break;
      case 'neq':
        q = q.neq(column, value);
        break;
      case 'gt':
        q = q.gt(column, value);
        break;
      case 'gte':
        q = q.gte(column, value);
        break;
      case 'lt':
        q = q.lt(column, value);
        break;
      case 'lte':
        q = q.lte(column, value);
        break;
      case 'like':
        q = q.like(column, value as string);
        break;
      case 'ilike':
        q = q.ilike(column, value as string);
        break;
      case 'in':
        q = q.in(column, value as readonly unknown[]);
        break;
    }
  });

  if (params.search && params.search.value.trim() !== '') {
    const { type } = params.search;

    if (type === 'ilike') {
      const term = `%${params.search.value}%`;
      const clause = params.search.columns.map((column) => `${column}.ilike.${term}`).join(',');
      q = q.or(clause);
    }
  }

  if (params.sort) {
    const sorts = Array.isArray(params.sort) ? params.sort : [params.sort];
    sorts.forEach(({ column, ascending = true, nullsFirst }) => {
      q = q.order(column, { ascending, nullsFirst });
    });
  }

  return q;
};
