/**
 * Client SP-API minimale per Amazon MCF.
 *
 * Autenticazione: Login with Amazon (LWA). Si scambia il refresh token con un
 * access token (valido ~1h) che viene messo in cache in memoria e allegato a
 * ogni chiamata nell'header `x-amz-access-token`. Da settembre 2023 Amazon non
 * richiede più la firma AWS SigV4 per le chiamate SP-API standard.
 *
 * SOLO server.
 */
import type { McfConfig } from "./config";

const LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token";

interface CachedToken {
  accessToken: string;
  /** epoch ms di scadenza (con margine di sicurezza). */
  expiresAt: number;
}

// Cache per-refreshToken (una sola app in pratica, ma corretto se più account).
const tokenCache = new Map<string, CachedToken>();

/** Errore normalizzato delle chiamate SP-API. */
export class SpApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "SpApiError";
  }
}

async function fetchAccessToken(config: McfConfig): Promise<string> {
  const cached = tokenCache.get(config.refreshToken);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const res = await fetch(LWA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new SpApiError(
      data.error_description || data.error || "LWA: token non ottenuto",
      res.status,
      data.error,
    );
  }

  const ttl = (data.expires_in ?? 3600) * 1000;
  tokenCache.set(config.refreshToken, {
    accessToken: data.access_token,
    expiresAt: Date.now() + ttl - 60_000, // 60s di margine
  });
  return data.access_token;
}

/**
 * Esegue una chiamata SP-API autenticata. `path` è relativo all'host regionale
 * (es. "/fba/outbound/2020-07-01/fulfillmentOrders"). Ritorna il JSON parsato.
 */
export async function spFetch<T = unknown>(
  config: McfConfig,
  path: string,
  init: { method?: string; body?: unknown; query?: Record<string, string> } = {},
): Promise<T> {
  const accessToken = await fetchAccessToken(config);

  const url = new URL(config.endpoint + path);
  for (const [k, v] of Object.entries(init.query ?? {})) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: init.method ?? "GET",
    headers: {
      "x-amz-access-token": accessToken,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const first = Array.isArray(json?.errors) ? json.errors[0] : undefined;
    throw new SpApiError(
      first?.message || `SP-API ${res.status} su ${path}`,
      res.status,
      first?.code,
    );
  }
  return json as T;
}
