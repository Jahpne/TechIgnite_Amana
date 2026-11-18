/**
 * Where to go after signing in. Only follows addresses inside this app, never another site,
 * so a crafted ?next=https://... link cannot send someone away.
 */
export function safeNext(next: string | undefined, fallback = "/agreements"): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
