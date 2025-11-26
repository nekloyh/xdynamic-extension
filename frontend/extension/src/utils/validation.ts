import { VALIDATION } from "./constants";

export const isValidEmail = (value: string): boolean => {
  const trimmed = value.trim();
  return VALIDATION.EMAIL_REGEX.test(trimmed);
};
