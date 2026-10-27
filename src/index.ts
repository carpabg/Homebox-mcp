import express from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { assertRuntimeConfig, config, homeboxRequest } from "./homebox.js";

assertRuntimeConfig();

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

function createServer(): McpServer {
  const server = new McpServer({
    name: "homebox-mcp",
    version: "1.0.0",
  });

  server.tool(
    "homebox_api_request",
    {
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
      path: z.string().describe("Homebox API path, e.g. /v1/entities or /v1/entities/{id}"),
      query: z.record(z.string(), z.any()).optional(),
      body: z.any().optional(),
    },
    async ({ method, path, query, body }) => {
      const result = await homeboxRequest(path, method, body, query);
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_list_entities",
    {
      q: z.string().optional().describe("Search query"),
      page: z.number().int().positive().optional(),
      pageSize: z.number().int().positive().max(500).optional(),
      orderBy: z.string().optional(),
      orderDirection: z.enum(["asc", "desc"]).optional(),
      tags: z.string().optional().describe("Comma-separated tag names or IDs"),
      matchAllTags: z.boolean().optional(),
      parentIds: z.string().optional().describe("Comma-separated parent entity IDs (location filter)"),
      entityTypeIds: z.string().optional().describe("Comma-separated entity type IDs (type filter)"),
    },
    async ({ q, page, pageSize, orderBy, orderDirection, tags, matchAllTags, parentIds, entityTypeIds }) => {
      const result = await homeboxRequest("/v1/entities", "GET", undefined, {
        q,
        page,
        pageSize,
        orderBy,
        orderDirection,
        tags,
        matchAllTags,
        parentIds,
        entityTypeIds,
      });
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_get_entity",
    { id: z.string().describe("Entity ID") },
    async ({ id }) => {
      const result = await homeboxRequest(`/v1/entities/${id}`, "GET");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_create_entity",
    { payload: z.any().describe("Entity payload to send to Homebox") },
    async ({ payload }) => {
      const result = await homeboxRequest("/v1/entities", "POST", payload);
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_update_entity",
    { id: z.string(), payload: z.any() },
    async ({ id, payload }) => {
      const result = await homeboxRequest(`/v1/entities/${id}`, "PUT", payload);
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_patch_entity",
    { id: z.string(), payload: z.any() },
    async ({ id, payload }) => {
      const result = await homeboxRequest(`/v1/entities/${id}`, "PATCH", payload);
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_delete_entity",
    { id: z.string() },
    async ({ id }) => {
      const result = await homeboxRequest(`/v1/entities/${id}`, "DELETE");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_entity_tree",
    {},
    async () => {
      const result = await homeboxRequest("/v1/entities/tree", "GET");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_location_statistics",
    {},
    async () => {
      const result = await homeboxRequest("/v1/groups/statistics/locations", "GET");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_list_entity_types",
    {},
    async () => {
      const result = await homeboxRequest("/v1/entity-types", "GET");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_create_entity_type",
    { payload: z.any() },
    async ({ payload }) => {
      const result = await homeboxRequest("/v1/entity-types", "POST", payload);
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_update_entity_type",
    { id: z.string(), payload: z.any() },
    async ({ id, payload }) => {
      const result = await homeboxRequest(`/v1/entity-types/${id}`, "PUT", payload);
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_delete_entity_type",
    { id: z.string() },
    async ({ id }) => {
      const result = await homeboxRequest(`/v1/entity-types/${id}`, "DELETE");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_list_tags",
    {},
    async () => {
      const result = await homeboxRequest("/v1/tags", "GET");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_get_tag",
    { id: z.string() },
    async ({ id }) => {
      const result = await homeboxRequest(`/v1/tags/${id}`, "GET");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_create_tag",
    { payload: z.any() },
    async ({ payload }) => {
      const result = await homeboxRequest("/v1/tags", "POST", payload);
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_update_tag",
    { id: z.string(), payload: z.any() },
    async ({ id, payload }) => {
      const result = await homeboxRequest(`/v1/tags/${id}`, "PUT", payload);
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_delete_tag",
    { id: z.string() },
    async ({ id }) => {
      const result = await homeboxRequest(`/v1/tags/${id}`, "DELETE");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_get_asset",
    { id: z.string().describe("Asset ID") },
    async ({ id }) => {
      const result = await homeboxRequest(`/v1/assets/${id}`, "GET");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_get_current_user",
    {},
    async () => {
      const result = await homeboxRequest("/v1/users/self", "GET");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_list_entity_fields",
    {},
    async () => {
      const result = await homeboxRequest("/v1/entities/fields", "GET");
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_entity_field_values",
    { field: z.string().describe("Field name to get distinct values for") },
    async ({ field }) => {
      const result = await homeboxRequest("/v1/entities/fields/values", "GET", undefined, { field });
      return asToolResult(result);
    }
  );

  server.tool(
    "homebox_group_statistics",
    {},
    async () => {
      const result = await homeboxRequest("/v1/groups/statistics", "GET");
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
    {},
    async () => {
      const result = await homeboxRequest("/v1/actions/set-primary-photos", "POST");
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

  return server;
}

const app = express();
const transports = new Map<string, StreamableHTTPServerTransport>();

app.use(express.json({ limit: "10mb" }));

async function checkHomeboxConnectivity() {
  await homeboxRequest("/v1/entities", "GET", undefined, { limit: 1 });
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
  } else if (sessionId && !transports.has(sessionId)) {
    // Session expired (server restarted) — client must re-initialize
    res.status(404).json({ error: "Session not found. Please re-initialize the MCP connection." });
    return;
  } else {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableJsonResponse: true,
      onsessioninitialized: (newSessionId) => {
        transports.set(newSessionId, transport);
      },
    });

    const mcpServer = createServer();
    await mcpServer.connect(transport);
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
