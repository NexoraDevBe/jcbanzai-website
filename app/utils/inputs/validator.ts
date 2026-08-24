import { InputType } from '~/utils/enums/inputs';

export const inputValidators: Partial<Record<InputType, (value: string) => boolean>> = {
  [InputType.NUMBER]: (value) => value.trim() !== '' && !Number.isNaN(Number(value)),
  [InputType.EMAIL]: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
  [InputType.PHONE]: (value) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    return /^(?:0\d{9}|\+32\d{9})$/.test(cleaned);
  },
};

export const validateByType = (type: InputType | undefined, value: string | number): boolean => {
  const validator = type ? inputValidators[type] : undefined;
  return validator ? validator(String(value)) : true;
};
