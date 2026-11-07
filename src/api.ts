import type { Card, MediaType } from "./types";

// Dev: "/api" goes through the Vite proxy. Prod: set VITE_API_URL at build time.
const BASE = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "mepmep.token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** One fetch wrapper: adds the JSON header and the login token, throws ApiError on failure. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(BASE + path, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const post = <T>(path: string, body: unknown) => api<T>(path, { method: "POST", body: JSON.stringify(body) });
export const put = <T>(path: string, body: unknown) => api<T>(path, { method: "PUT", body: JSON.stringify(body) });
export const del = (path: string) => api<void>(path, { method: "DELETE" });

// ---- image + card helpers ----
export const img = (path: string | null | undefined, size = "w342") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

/** Turns a raw TMDB result into a Card. `fallback` is used by list endpoints that omit media_type. */
export function toCard(r: Record<string, any>, fallback?: MediaType): Card | null {
  const mediaType: MediaType | undefined = r.media_type ?? fallback;
  if (mediaType !== "movie" && mediaType !== "tv") return null; // skips "person" results
  return {
    mediaType,
    id: r.id,
    title: r.title ?? r.name ?? "Untitled",
    posterPath: r.poster_path ?? null,
    voteAverage: r.vote_average ?? null,
    year: (r.release_date ?? r.first_air_date ?? "").slice(0, 4) || null,
  };
}

export const toCards = (results: Record<string, any>[], fallback?: MediaType) =>
  results.map((r) => toCard(r, fallback)).filter((c): c is Card => c !== null);

/** Seconds -> "1h 05m" */
export function fmtRuntime(min?: number) {
  if (!min) return "";
  return min >= 60 ? `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m` : `${min}m`;
}
