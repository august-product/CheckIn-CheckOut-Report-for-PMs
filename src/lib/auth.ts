export const AUTH_STORAGE_KEY = "valeria_is_logged_in";
const USER_STORAGE_KEY = "valeria_user_profile";

export interface StoredUser {
  name: string;
  email: string;
}

const safeWindow = typeof window !== "undefined";

export const storeUser = (user: StoredUser) => {
  if (!safeWindow) return;
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getStoredUser = (): StoredUser | null => {
  if (!safeWindow) return null;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return {
        name: typeof parsed.name === "string" ? parsed.name : "",
        email: typeof parsed.email === "string" ? parsed.email : ""
      };
    }
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
  return null;
};

export const markLoggedIn = (user?: StoredUser) => {
  if (!safeWindow) return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, "true");
  if (user) {
    storeUser(user);
  }
};

export const clearLoggedIn = () => {
  if (!safeWindow) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
};

export const isLoggedIn = () => {
  if (!safeWindow) return false;
  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
};

const coalesceUserSource = (payload: unknown): Record<string, unknown> | null => {
  if (!payload || typeof payload !== "object") return null;
  if ("user" in payload && payload.user && typeof payload.user === "object") {
    return payload.user as Record<string, unknown>;
  }
  if ("data" in payload && payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data as Record<string, unknown>;
  }
  return payload as Record<string, unknown>;
};

export const resolveUserFromPayload = (payload: unknown, fallbackEmail: string): StoredUser => {
  const source = coalesceUserSource(payload);
  const firstName =
    (source?.first_name as string | undefined) ??
    (source?.firstName as string | undefined) ??
    (source?.given_name as string | undefined) ??
    "";
  const lastName =
    (source?.last_name as string | undefined) ??
    (source?.lastName as string | undefined) ??
    (source?.family_name as string | undefined) ??
    "";
  const combinedName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const displayName =
    ((source?.name as string | undefined) ?? combinedName) ||
    fallbackEmail;
  const resolvedEmail = (source?.email as string | undefined) ?? fallbackEmail;

  return {
    name: displayName,
    email: resolvedEmail
  };
};
