import type { StartGameResponse, SubmitMovePayload, SubmitMoveResponse, BackendGameSnapshot } from "../../types/chess";

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, "") ?? "http://127.0.0.1:8787";

const SESSION_STORAGE_KEY = "chess-backend-session";

export interface StoredSession {
  gameId: string;
  playerToken: string;
}

interface ErrorResponse {
  error?: {
    message?: string;
  };
}

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as ErrorResponse;
    return payload.error?.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const authorizedFetch = async (path: string, options: RequestInit = {}, token?: string): Promise<Response> => {
  const headers = new Headers(options.headers);
  headers.set("content-type", "application/json");
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response;
};

export const getStoredSession = (): StoredSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredSession;
  } catch {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

export const storeSession = (session: StoredSession): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

export const startGame = async (): Promise<StartGameResponse> => {
  const response = await authorizedFetch("/game/start", {
    method: "POST",
    body: JSON.stringify({}),
  });

  return (await response.json()) as StartGameResponse;
};

export const fetchGame = async (session: StoredSession): Promise<BackendGameSnapshot> => {
  const response = await authorizedFetch(`/game/${session.gameId}`, {
    method: "GET",
  }, session.playerToken);

  return (await response.json()) as BackendGameSnapshot;
};

export const submitMove = async (
  session: StoredSession,
  payload: SubmitMovePayload,
): Promise<SubmitMoveResponse> => {
  const response = await authorizedFetch(`/game/${session.gameId}/move`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, session.playerToken);

  return (await response.json()) as SubmitMoveResponse;
};
