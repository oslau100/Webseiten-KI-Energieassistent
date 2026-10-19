/** A customer's rating must be present in its own config; never infer five stars. */
export function marketingReviewRating(value: unknown, customerRuntime: boolean): number | undefined {
  if (!customerRuntime) return 5;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 5) return value;
  return undefined;
}
