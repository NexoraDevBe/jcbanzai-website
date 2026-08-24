import type { Options } from '~/components/atom/table/TableSelect.vue';
import { InputType } from '~/utils/enums/inputs';

export const inputFormatters: Partial<Record<InputType, (value: string) => string>> = {
  [InputType.PHONE]: (value) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+32')) {
      const digits = cleaned.slice(3);
      return `+32 ${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
    }
    if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
    }
    return value;
  },
};

export const formatByType = (
  type: InputType | undefined,
  value: string | number,
): string | number => {
  const formatter = type ? inputFormatters[type] : undefined;
  return formatter ? formatter(String(value)) : value;
};

export const formatEnumToOptions = <T extends Record<string, string>>(
  enumObj: T,
  enumLabelObj: Partial<Record<T[keyof T], string>> = {},
): Options => {
  return (Object.values(enumObj) as T[keyof T][]).map((value) => ({
    value,
    label: enumLabelObj[value] ?? value,
  }));
};
