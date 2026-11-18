import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getMe } from "../api/auth";
import { clearSession, getSession } from "../auth/session";

/** The signed-in user, or undefined when nobody is signed in. */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: getSession() !== null,
    staleTime: 5 * 60 * 1000,
  });
}

/** Clears the session and every cached answer, then goes to sign-in. */
export function useSignOut() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return () => {
    clearSession();
    qc.clear();
    void navigate({ to: "/signin" });
  };
}
