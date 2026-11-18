import { ApiError } from "../api/client";

/** One place that turns any failure into text a person can read. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 0) return "We could not reach the server. Check your connection and try again.";
    if (err.status === 403) return "You do not have access to this.";
    if (err.status === 502) return "The payment or delivery provider is unavailable. Try again shortly.";
    return err.message;
  }
  return "Something went wrong. Please try again.";
}
