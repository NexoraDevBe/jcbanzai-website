export type SortDirection = 'asc' | 'desc';

export type SortState<T> = { key: keyof T; direction: SortDirection } | null;

export type SortableColumn<T> = {
  key: keyof T;
  label: string;
};

export type FilterOption = {
  label: string;
  value: string;
};

export type DateRangeValue = { from?: string; to?: string };

export type FilterableColumn<T> =
  | {
      key: keyof T;
      label: string;
      type?: 'options'; // default, keep existing behavior
      options?: { label: string; value: string }[];
    }
  | {
      key: keyof T;
      label: string;
      type: 'date';
    };

// FilterState now needs to hold either kind of value
export type FilterState<T> = Partial<Record<keyof T, Set<string> | DateRangeValue>>;

// export type FilterState<T> = Partial<Record<keyof T, Set<string>>>;

export function applySort<T>(data: T[], sort: SortState<T>): T[] {
  if (!sort) return data;
  const { key, direction } = sort;

  const sorted = [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') return aVal - bVal;
    return String(aVal).localeCompare(String(bVal), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

  return direction === 'asc' ? sorted : sorted.reverse();
}

function isDateRange(value: unknown): value is DateRangeValue {
  return !!value && typeof value === 'object' && !(value instanceof Set);
}

export function applyFilters<T>(data: T[], filters: FilterState<T>): T[] {
  const activeEntries = Object.entries(filters).filter(([, val]) => {
    if (val instanceof Set) return val.size > 0;
    if (isDateRange(val)) return !!(val.from || val.to);
    return false;
  }) as [keyof T, Set<string> | DateRangeValue][];

  if (!activeEntries.length) return data;

  return data.filter((row) =>
    activeEntries.every(([key, filterValue]) => {
      const value = row[key];

      if (filterValue instanceof Set) {
        if (Array.isArray(value)) return value.some((v) => filterValue.has(String(v)));
        return filterValue.has(String(value));
      }

      // DateRangeValue
      const rowDate = String(value).slice(0, 10);
      if (filterValue.from && rowDate < filterValue.from) return false;
      if (filterValue.to && rowDate > filterValue.to) return false;
      return true;
    }),
  );
}

export function applySearch<T>(data: T[], search: string, keys: (keyof T)[]): T[] {
  const term = search.trim().toLowerCase();
  if (!term && term !== '') return data;
  return data.filter((row) =>
    keys.some((key) =>
      String(row[key] ?? '')
        .toLowerCase()
        .includes(term),
    ),
  );
}

export function deriveFilterOptions<T>(data: T[], key: keyof T): FilterOption[] {
  const seen = new Set<string>();

  for (const row of data) {
    const raw = row[key];
    if (raw == null || raw === '') continue;
    if (Array.isArray(raw)) {
      raw.forEach((v) => seen.add(String(v)));
    } else {
      seen.add(String(raw));
    }
  }

  return Array.from(seen)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((v) => ({ label: v, value: v }));
}
