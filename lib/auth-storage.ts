"use client";

/** Kunci baru; nama lama disinkron dari `LEGACY_*` agar pengguna tidak perlu masuk lagi. */
export const STORAGE_ACCESS_TOKEN_KEY = "neodeeps_access_token";
export const STORAGE_USER_KEY = "neodeeps_user";

const LEGACY_ACCESS_TOKEN_KEY = "findcommunity_access_token";
const LEGACY_USER_KEY = "findcommunity_user";

function migrateLegacyAuthStorage(): void {
  if (typeof window === "undefined") return;
  const migrate = (from: string, to: string) => {
    const next = localStorage.getItem(to);
    const prev = localStorage.getItem(from);
    if (!next && prev != null) {
      localStorage.setItem(to, prev);
      localStorage.removeItem(from);
    }
  };
  migrate(LEGACY_ACCESS_TOKEN_KEY, STORAGE_ACCESS_TOKEN_KEY);
  migrate(LEGACY_USER_KEY, STORAGE_USER_KEY);
}

export function setSession(token: string, user: unknown): void {
  migrateLegacyAuthStorage();
  localStorage.setItem(STORAGE_ACCESS_TOKEN_KEY, token);
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function clearSession(): void {
  migrateLegacyAuthStorage();
  localStorage.removeItem(STORAGE_ACCESS_TOKEN_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function getStoredToken(): string | null {
  migrateLegacyAuthStorage();
  return localStorage.getItem(STORAGE_ACCESS_TOKEN_KEY);
}

/** JSON pengguna dari penyimpanan, setelah sinkron dari kunci lama bila ada. */
export function getStoredUserRaw(): string | null {
  migrateLegacyAuthStorage();
  return localStorage.getItem(STORAGE_USER_KEY);
}
