import { auth } from "@/lib/firebase";

const BASE = ((import.meta.env.VITE_API_URL as string | undefined) || "/api").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface Options {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  auth?: boolean;
}

async function request<T>(path: string, { method = "GET", body, params, auth: needsAuth = false }: Options = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (needsAuth) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new ApiError(401, "UNAUTHORIZED", "Log in to continue");
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check that the API is running and try again.");
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const e = json?.error;
    throw new ApiError(res.status, e?.code ?? "ERROR", e?.message ?? `Request failed (${res.status})`, e?.details);
  }
  return json as T;
}

export const api = {
  get: <T>(path: string, options?: Options) => request<T>(path, options),
  post: <T>(path: string, body: unknown, options?: Options) => request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body: unknown, options?: Options) => request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Options) => request<T>(path, { ...options, method: "DELETE" }),
};

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong");
