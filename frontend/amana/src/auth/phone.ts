/**
 * The backend stores phones as +234..., for example +2348010000002.
 * People type 0801 234 5678, so convert before sending.
 */
export function toE164(input: string): string {
  const digits = input.replace(/[\s-]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  return digits;
}
