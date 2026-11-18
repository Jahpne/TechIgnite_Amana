export function getSession(): string | null {
  try { return localStorage.getItem('amana.session') } catch { return null }
}
export function setSession(token: string) {
  try { localStorage.setItem('amana.session', token) } catch { /* private mode */ }
}
export function clearSession() {
  try { localStorage.removeItem('amana.session') } catch { /* ignore */ }
}