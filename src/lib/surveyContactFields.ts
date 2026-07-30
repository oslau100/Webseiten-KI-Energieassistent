/** Shared contact rules used by the Kromen Settings and Rechnung surveys. */
export const SURVEY_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeSurveyEmail = (value: string) => value.trim();
export const isValidSurveyEmail = (value: string) => SURVEY_EMAIL_PATTERN.test(normalizeSurveyEmail(value));

export const isValidSurveyPhone = (value: string) => {
  const compact = String(value || "").trim().replace(/[\s/\-()]/g, "");
  if (!/^\+?\d+$/.test(compact)) return false;
  const digits = compact.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 20) return false;
  if (/^(\d)\1+$/.test(digits) || /^(?:123456|0123456)/.test(digits)) return false;
  return true;
};

export const germanPhoneLocalValue = (value: string) => value.trim().replace(/^(?:\+49|0049)[\s/\-()]*/, "");

export const normalizeGermanSurveyPhone = (value: string) => {
  const local = germanPhoneLocalValue(value).replace(/[\s/\-()]/g, "").replace(/^0/, "");
  if (!isValidSurveyPhone(local)) return null;
  const international = `+49${local}`;
  return isValidSurveyPhone(international) ? international : null;
};
