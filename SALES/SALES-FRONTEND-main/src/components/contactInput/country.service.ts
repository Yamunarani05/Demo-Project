import { parsePhoneNumberFromString } from "libphonenumber-js";

export interface Country {
  code: string;     // IN, US, GB
  name: string;
  dialCode: string; // +91, +1
}

import countriesData from "./countries.json";

export const fetchCountries = async (): Promise<Country[]> => {
  return countriesData as Country[];
};

/** ✅ CORRECT UNIVERSAL VALIDATION */
export const validatePhone = (
  nationalNumber: string,
  countryCode: string
): boolean => {
  const phone = parsePhoneNumberFromString(
    nationalNumber,
    countryCode as any
  );

  if (!phone) return false;

  return phone.isPossible() && phone.isValid();
};
