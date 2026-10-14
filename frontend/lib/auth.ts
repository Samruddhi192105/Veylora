export const AUTH_TOKEN_KEY = "veylora_access_token";
export const GAME_SESSION_KEY = "veylora_session_id";

export type VeyloraUser = {
  user_id: string;
  email: string;
  name: string;
};

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function storeAuthSession(
  token: string,
  user: VeyloraUser
) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem("veylora_user", JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem("veylora_user");
  localStorage.removeItem(GAME_SESSION_KEY);
}

export function authHeaders(
  extraHeaders: Record<string, string> = {}
): Record<string, string> {
  const token = getAuthToken();
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
