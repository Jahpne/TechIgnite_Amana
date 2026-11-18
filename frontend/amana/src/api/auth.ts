import { http } from "./client";

export interface OtpRequestResult {
  sent: boolean;
  /** Only returned while the backend runs with OTP_DEBUG=true. Never build UI that depends on it. */
  debugCode?: string;
}

export interface ApiUser {
  id: string;
  phone: string;
  name?: string | null;
  isAdmin?: boolean;
}

export interface VerifyResult {
  token: string;
  user: ApiUser;
}

export const requestOTP = (phone: string) =>
  http.post<OtpRequestResult>("/auth/otp/request", { phone }).then((r) => r.data);

export const verifyOTP = (phone: string, code: string) =>
  http.post<VerifyResult>("/auth/otp/verify", { phone, code }).then((r) => r.data);

/** The signed-in user. Also a cheap way to check that a stored token is still valid. */
export const getMe = () => http.get<ApiUser>("/auth/me").then((r) => r.data);
