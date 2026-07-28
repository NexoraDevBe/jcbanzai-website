// utils/validation.ts

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customMessage?: string;
}

/**
 * Validates text input
 */
export const validateText = (
  value: string,
  fieldName: string = "Dit veld",
  options: ValidationOptions = {},
): ValidationResult => {
  const { required = true, minLength, maxLength, pattern } = options;

  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }

  if (!value || value.trim().length === 0) {
    return { isValid: true }; // Optional and empty
  }

  if (minLength && value.trim().length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} moet minstens ${minLength} karakters bevatten`,
    };
  }

  if (maxLength && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} mag maximaal ${maxLength} karakters bevatten`,
    };
  }

  if (pattern && !pattern.test(value)) {
    return {
      isValid: false,
      error: options.customMessage || `${fieldName} heeft een ongeldig formaat`,
    };
  }

  return { isValid: true };
};

/**
 * Validates name input (letters, spaces, hyphens, apostrophes only)
 */
export const validateName = (
  value: string,
  fieldName: string = "Naam",
  options: Omit<ValidationOptions, "pattern"> = {},
): ValidationResult => {
  const namePattern =
    /^[a-zA-ZàáâãäåçèéêëìíîïðñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝŸ\s'-]+$/;

  return validateText(value, fieldName, {
    ...options,
    minLength: options.minLength || 2,
    maxLength: options.maxLength || 50,
    pattern: namePattern,
    customMessage: `${fieldName} mag alleen letters bevatten`,
  });
};

/**
 * Validates email input
 */
export const validateEmail = (
  value: string,
  fieldName: string = "Email",
  options: { required?: boolean; maxLength?: number } = {},
): ValidationResult => {
  const { required = true, maxLength = 254 } = options;

  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }

  if (!value || value.trim().length === 0) {
    return { isValid: true }; // Optional and empty
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: `${fieldName} is ongeldig` };
  }

  if (value.length > maxLength) {
    return { isValid: false, error: `${fieldName} is te lang` };
  }

  return { isValid: true };
};

/**
 * Validates phone number
 */
export const validatePhone = (
  value: string,
  fieldName: string = "Telefoonnummer",
  options: { required?: boolean; country?: "BE" | "NL" | "generic" } = {},
): ValidationResult => {
  const { required = true, country = "BE" } = options;

  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }

  if (!value || value.trim().length === 0) {
    return { isValid: true }; // Optional and empty
  }

  const cleanPhone = value.replace(/[\s\-\.\/\(\)]/g, "");

  let phoneRegex: RegExp;
  let errorMsg: string;

  switch (country) {
    case "BE":
      // Belgian: 04XX XX XX XX or 0X XXX XX XX
      phoneRegex = /^(\+32|0032|0)?[1-9]\d{7,8}$/;
      errorMsg = `${fieldName} is ongeldig (verwacht Belgisch nummer)`;
      break;
    case "NL":
      // Dutch: 06 XXXX XXXX or 0XX XXX XXXX
      phoneRegex = /^(\+31|0031|0)?[1-9]\d{8,9}$/;
      errorMsg = `${fieldName} is ongeldig (verwacht Nederlands nummer)`;
      break;
    default:
      // Generic: at least 7 digits
      phoneRegex = /^[\+]?[\d\s\-\(\)]{7,}$/;
      errorMsg = `${fieldName} is ongeldig`;
  }

  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: errorMsg };
  }

  return { isValid: true };
};

/**
 * Validates date input
 */
export const validateDate = (
  value: string,
  fieldName: string = "Datum",
  options: {
    required?: boolean;
    min?: Date | "today" | "past";
    max?: Date | "today" | "future";
    minAge?: number;
    maxAge?: number;
  } = {},
): ValidationResult => {
  const { required = true, min, max, minAge, maxAge } = options;

  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }

  if (!value || value.trim().length === 0) {
    return { isValid: true }; // Optional and empty
  }

  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName} is ongeldig` };
  }

  // Handle min constraint
  if (min === "today" && date < today) {
    return {
      isValid: false,
      error: `${fieldName} moet vandaag of in de toekomst zijn`,
    };
  }
  if (min === "past" && date >= today) {
    return {
      isValid: false,
      error: `${fieldName} moet in het verleden liggen`,
    };
  }
  if (min instanceof Date && date < min) {
    return { isValid: false, error: `${fieldName} is te vroeg` };
  }

  // Handle max constraint
  if (max === "today" && date > today) {
    return {
      isValid: false,
      error: `${fieldName} kan niet in de toekomst liggen`,
    };
  }
  if (max === "future" && date <= today) {
    return { isValid: false, error: `${fieldName} moet in de toekomst liggen` };
  }
  if (max instanceof Date && date > max) {
    return { isValid: false, error: `${fieldName} is te laat` };
  }

  // Calculate age if needed
  if (minAge || maxAge) {
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (minAge && actualAge < minAge) {
      return {
        isValid: false,
        error: `Je moet minstens ${minAge} jaar oud zijn`,
      };
    }

    if (maxAge && actualAge > maxAge) {
      return {
        isValid: false,
        error: `Je mag maximaal ${maxAge} jaar oud zijn`,
      };
    }
  }

  return { isValid: true };
};

/**
 * Validates select/dropdown input
 */
export const validateSelect = (
  value: string,
  fieldName: string = "Dit veld",
  options: { required?: boolean; allowedValues?: string[] } = {},
): ValidationResult => {
  const { required = true, allowedValues } = options;

  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }

  if (!value || value.trim().length === 0) {
    return { isValid: true }; // Optional and empty
  }

  if (allowedValues && !allowedValues.includes(value)) {
    return { isValid: false, error: `${fieldName} bevat een ongeldige waarde` };
  }

  return { isValid: true };
};

/**
 * Validates checkbox input
 */
export const validateCheckbox = (
  value: boolean,
  fieldName: string = "Dit veld",
  options: { required?: boolean } = {},
): ValidationResult => {
  const { required = true } = options;

  if (required && !value) {
    return { isValid: false, error: `${fieldName} moet aangevinkt zijn` };
  }

  return { isValid: true };
};

/**
 * Validates number input
 */
export const validateNumber = (
  value: string | number,
  fieldName: string = "Dit veld",
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
  } = {},
): ValidationResult => {
  const { required = true, min, max, integer = false } = options;

  const strValue = String(value).trim();

  if (required && strValue.length === 0) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }

  if (strValue.length === 0) {
    return { isValid: true }; // Optional and empty
  }

  const numValue = Number(strValue);

  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} moet een getal zijn` };
  }

  if (integer && !Number.isInteger(numValue)) {
    return { isValid: false, error: `${fieldName} moet een heel getal zijn` };
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `${fieldName} moet minimaal ${min} zijn` };
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `${fieldName} mag maximaal ${max} zijn` };
  }

  return { isValid: true };
};

/**
 * Validates zipcode/postal code
 */
export const validateZipcode = (
  value: string,
  fieldName: string = "Postcode",
  options: { required?: boolean; country?: "BE" | "NL" | "generic" } = {},
): ValidationResult => {
  const { required = true, country = "BE" } = options;

  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }

  if (!value || value.trim().length === 0) {
    return { isValid: true }; // Optional and empty
  }

  let zipRegex: RegExp;
  let errorMsg: string;

  switch (country) {
    case "BE":
      // Belgian: 4 digits, first digit 1-9
      zipRegex = /^[1-9]\d{3}$/;
      errorMsg = `${fieldName} moet 4 cijfers bevatten`;
      break;
    case "NL":
      // Dutch: 4 digits + 2 letters (1234 AB)
      zipRegex = /^\d{4}\s?[A-Z]{2}$/i;
      errorMsg = `${fieldName} moet het formaat 1234 AB hebben`;
      break;
    default:
      // Generic: 3-10 alphanumeric characters
      zipRegex = /^[A-Z0-9\s\-]{3,10}$/i;
      errorMsg = `${fieldName} is ongeldig`;
  }

  if (!zipRegex.test(value.trim())) {
    return { isValid: false, error: errorMsg };
  }

  return { isValid: true };
};

/**
 * Validates zipcode/postal code
 */
export const validateGraad = (
  value: string,
  fieldName: string = "Graad",
): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { isValid: true }; // Optional and empty
  }

  let errorMsg: string;
  const ranks = [
    "01-Beginner",
    "02-Kyu 6",
    "03-Kyu 5",
    "04-Kyu 4",
    "05-Kyu 3",
    "06-Kyu 2",
    "07-Kyu 1",
    "08-Dan 1",
    "09-Dan 2",
    "10-Dan 3",
    "11-Dan 4",
    "12-Dan 5",
    "13-Dan 6",
    "14-Dan 7",
    "15-Dan 8",
    "16-Dan 9",
    "17-Dan 10",
  ] as const;

  if (!(ranks as readonly string[]).includes(value)) {
    errorMsg = `${fieldName} is niet geldig`;
    return { isValid: false, error: errorMsg };
  }

  return { isValid: true };
};
