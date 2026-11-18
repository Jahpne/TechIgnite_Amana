import axios, { AxiosError } from "axios";
import { config } from "../config";
import { getSession, clearSession } from "../auth/session"; // adjust path

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const http = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
});

http.interceptors.request.use((req) => {
  const token = getSession();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const status = err.response?.status ?? 0;
    if (status === 401) clearSession();
    const message =
      err.response?.data?.message ?? "Something went wrong. Please try again.";
    return Promise.reject(new ApiError(status, message));
  },
);
