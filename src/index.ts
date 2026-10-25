import express from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { assertRuntimeConfig, config, homeboxRequest } from "./homebox.js";

assertRuntimeConfig();

const server = new McpServer({
  name: "homebox-mcp",
  version: "1.0.0",
});

function asToolResult(payload: unknown) {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);

  return {
    content: [
      {
        type: "text" as const,
        text,
      },
    ],
  };
}

const paginationSchema = {
  limit: z.number().int().positive().max(500).optional(),
  offset: z.number().int().nonnegative().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
};

server.tool(
  "homebox_api_request",
  {
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
    path: z.string().describe("Homebox API path, e.g. /v1/items or /v1/items/{id}"),
    query: z.record(z.string(), z.any()).optional(),
    body: z.any().optional(),
  },
  async ({ method, path, query, body }) => {
    const result = await homeboxRequest(path, method, body, query);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_list_items",
  {
    ...paginationSchema,
    q: z.string().optional(),
    location_id: z.string().optional(),
    category_id: z.string().optional(),
  },
  async ({ limit, offset, sort, order, q, location_id, category_id }) => {
    const result = await homeboxRequest("/v1/items", "GET", undefined, {
      limit,
      offset,
      sort,
      order,
      q,
      location_id,
      category_id,
    });
    return asToolResult(result);
  }
);

server.tool(
  "homebox_get_item",
  { id: z.string().describe("Item ID") },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/items/${id}`, "GET");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_create_item",
  { payload: z.any().describe("Item payload to send to Homebox") },
  async ({ payload }) => {
    const result = await homeboxRequest("/v1/items", "POST", payload);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_update_item",
  { id: z.string(), payload: z.any() },
  async ({ id, payload }) => {
    const result = await homeboxRequest(`/v1/items/${id}`, "PUT", payload);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_delete_item",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/items/${id}`, "DELETE");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_list_locations",
  { ...paginationSchema, q: z.string().optional() },
  async ({ limit, offset, sort, order, q }) => {
    const result = await homeboxRequest("/v1/locations", "GET", undefined, { limit, offset, sort, order, q });
    return asToolResult(result);
  }
);

server.tool(
  "homebox_get_location",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/locations/${id}`, "GET");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_create_location",
  { payload: z.any() },
  async ({ payload }) => {
    const result = await homeboxRequest("/v1/locations", "POST", payload);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_update_location",
  { id: z.string(), payload: z.any() },
  async ({ id, payload }) => {
    const result = await homeboxRequest(`/v1/locations/${id}`, "PUT", payload);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_delete_location",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/locations/${id}`, "DELETE");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_list_categories",
  { ...paginationSchema, q: z.string().optional() },
  async ({ limit, offset, sort, order, q }) => {
    const result = await homeboxRequest("/v1/categories", "GET", undefined, { limit, offset, sort, order, q });
    return asToolResult(result);
  }
);

server.tool(
  "homebox_get_category",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/categories/${id}`, "GET");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_create_category",
  { payload: z.any() },
  async ({ payload }) => {
    const result = await homeboxRequest("/v1/categories", "POST", payload);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_update_category",
  { id: z.string(), payload: z.any() },
  async ({ id, payload }) => {
    const result = await homeboxRequest(`/v1/categories/${id}`, "PUT", payload);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_delete_category",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/categories/${id}`, "DELETE");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_list_labels",
  { ...paginationSchema, q: z.string().optional() },
  async ({ limit, offset, sort, order, q }) => {
    const result = await homeboxRequest("/v1/labels", "GET", undefined, { limit, offset, sort, order, q });
    return asToolResult(result);
  }
);

server.tool(
  "homebox_get_label",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/labels/${id}`, "GET");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_create_label",
  { payload: z.any() },
  async ({ payload }) => {
    const result = await homeboxRequest("/v1/labels", "POST", payload);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_update_label",
  { id: z.string(), payload: z.any() },
  async ({ id, payload }) => {
    const result = await homeboxRequest(`/v1/labels/${id}`, "PUT", payload);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_delete_label",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/labels/${id}`, "DELETE");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_list_assets",
  { ...paginationSchema, q: z.string().optional() },
  async ({ limit, offset, sort, order, q }) => {
    const result = await homeboxRequest("/v1/assets", "GET", undefined, { limit, offset, sort, order, q });
    return asToolResult(result);
  }
);

server.tool(
  "homebox_get_asset",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/assets/${id}`, "GET");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_list_users",
  { ...paginationSchema },
  async ({ limit, offset, sort, order }) => {
    const result = await homeboxRequest("/v1/users", "GET", undefined, { limit, offset, sort, order });
    return asToolResult(result);
  }
);

server.tool(
  "homebox_get_user",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/users/${id}`, "GET");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_list_fields",
  { ...paginationSchema },
  async ({ limit, offset, sort, order }) => {
    const result = await homeboxRequest("/v1/fields", "GET", undefined, { limit, offset, sort, order });
    return asToolResult(result);
  }
);

server.tool(
  "homebox_get_field",
  { id: z.string() },
  async ({ id }) => {
    const result = await homeboxRequest(`/v1/fields/${id}`, "GET");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_create_missing_thumbnails",
  {},
  async () => {
    const result = await homeboxRequest("/v1/actions/create-missing-thumbnails", "POST");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_ensure_asset_ids",
  {},
  async () => {
    const result = await homeboxRequest("/v1/actions/ensure-asset-ids", "POST");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_ensure_import_refs",
  {},
  async () => {
    const result = await homeboxRequest("/v1/actions/ensure-import-refs", "POST");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_set_primary_photos",
  { payload: z.any() },
  async ({ payload }) => {
    const result = await homeboxRequest("/v1/actions/set-primary-photos", "POST", payload);
    return asToolResult(result);
  }
);

server.tool(
  "homebox_wipe_inventory",
  {},
  async () => {
    const result = await homeboxRequest("/v1/actions/wipe-inventory", "POST");
    return asToolResult(result);
  }
);

server.tool(
  "homebox_zero_item_time_fields",
  {},
  async () => {
    const result = await homeboxRequest("/v1/actions/zero-item-time-fields", "POST");
    return asToolResult(result);
  }
);

const app = express();
const transports = new Map<string, StreamableHTTPServerTransport>();

app.use(express.json({ limit: "10mb" }));

async function checkHomeboxConnectivity() {
  await homeboxRequest("/v1/items", "GET", undefined, { limit: 1 });
}

function requireMcpBearerToken(req: any, res: any, next: any) {
  const expected = `Bearer ${config.mcpAuthToken}`;
  const authHeader = req.headers.authorization ?? "";

  if (authHeader !== expected) {
    res.status(401).json({ error: "Unauthorized: invalid or missing MCP bearer token" });
    return;
  }

  next();
}

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, name: "homebox-mcp" });
});

app.get("/readyz", async (_req, res) => {
  try {
    await checkHomeboxConnectivity();
    res.json({ ok: true, homebox: "reachable" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    res.status(503).json({ ok: false, homebox: "unreachable", error: message });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "homebox-mcp", deprecated: "use /healthz" });
});

app.all("/mcp", requireMcpBearerToken, async (req, res) => {
  const sessionHeader = req.headers["mcp-session-id"];
  const sessionId = Array.isArray(sessionHeader) ? sessionHeader[0] : sessionHeader;

  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports.has(sessionId)) {
    transport = transports.get(sessionId)!;
  } else {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableJsonResponse: true,
      onsessioninitialized: (newSessionId) => {
        transports.set(newSessionId, transport);
      },
    });

    await server.connect(transport);
  }

  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP stream request failed:", error);
    res.status(500).json({ error: "Internal MCP server error" });
  }
});

app.listen(config.port, "0.0.0.0", () => {
  console.log(`Homebox MCP server listening on http://0.0.0.0:${config.port}/mcp`);
});
