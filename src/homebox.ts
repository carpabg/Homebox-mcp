import dotenv from "dotenv";

dotenv.config();

type QueryValue = string | number | boolean | undefined | null;

export const config = {
  port: Number(process.env.PORT ?? 3000),
  mcpAuthToken: process.env.MCP_AUTH_TOKEN ?? "",
  homeboxBaseUrl: normalizeBaseUrl(process.env.HOMEBOX_BASE_URL ?? "http://homebox:7745"),
  homeboxApiToken: process.env.HOMEBOX_API_TOKEN ?? "",
};

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export function assertRuntimeConfig(): void {
  if (!config.mcpAuthToken) {
    throw new Error("MCP_AUTH_TOKEN is not set");
  }

  if (!config.homeboxApiToken) {
    throw new Error("HOMEBOX_API_TOKEN is not set");
  }

  if (!config.homeboxBaseUrl) {
    throw new Error("HOMEBOX_BASE_URL is not set");
  }
}

export async function homeboxRequest<T = unknown>(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
  query?: Record<string, QueryValue>
): Promise<T> {
  const sanitizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${config.homeboxBaseUrl}/api${sanitizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.homeboxApiToken}`,
    Accept: "application/json",
  };

  const requestInit: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined && body !== null && method !== "GET" && method !== "DELETE") {
    headers["Content-Type"] = "application/json";
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), requestInit);

  // Homebox SPA fallback returns 200 HTML for unmatched routes — detect and fail fast
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    throw new Error(
      `Homebox returned HTML instead of JSON for ${method} ${url.pathname}. ` +
      `Check that HOMEBOX_BASE_URL includes the /api path prefix (e.g. http://homebox:7745/api).`
    );
  }

  const text = await response.text();

  let payload: unknown = null;
  if (text && text.trim().length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const reason =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as { message?: string }).message ?? response.statusText)
        : `Homebox API error ${response.status}: ${response.statusText}`;

    throw new Error(reason);
  }

  return (payload ?? null) as T;
}
