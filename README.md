# Homebox MCP Server

A dockerized MCP server that exposes Homebox inventory operations over Streamable HTTP.

## Required environment variables

- `MCP_AUTH_TOKEN`: bearer token that Hermes or another MCP client must send to the MCP endpoint
- `HOMEBOX_API_TOKEN`: Homebox API token used to authenticate to the upstream Homebox instance
- `HOMEBOX_BASE_URL`: base URL of the Homebox server, for example `http://homebox:7745`

## Run locally

1. Copy `.env.example` to `.env`
2. Fill in your values
3. Run:

```bash
docker compose up --build
```

## MCP auth

The server requires this header on requests to `/mcp`:

```http
Authorization: Bearer <MCP_AUTH_TOKEN>
```

Example endpoint:

```text
http://localhost:3000/mcp
```

## Exposed tools

- `homebox_api_request`
- `homebox_list_items`
- `homebox_get_item`
- `homebox_create_item`
- `homebox_update_item`
- `homebox_delete_item`
- `homebox_list_locations`
- `homebox_get_location`
- `homebox_create_location`
- `homebox_update_location`
- `homebox_delete_location`
- `homebox_list_categories`
- `homebox_get_category`
- `homebox_create_category`
- `homebox_update_category`
- `homebox_delete_category`
- `homebox_list_labels`
- `homebox_get_label`
- `homebox_create_label`
- `homebox_update_label`
- `homebox_delete_label`
- `homebox_list_assets`
- `homebox_get_asset`
- `homebox_list_users`
- `homebox_get_user`
- `homebox_list_fields`
- `homebox_get_field`
- `homebox_create_missing_thumbnails`
- `homebox_ensure_asset_ids`
- `homebox_ensure_import_refs`
- `homebox_set_primary_photos`
- `homebox_wipe_inventory`
- `homebox_zero_item_time_fields`

## Notes

This project intentionally uses the official MCP SDK and keeps the upstream Homebox credentials in environment variables instead of embedding them into the client or source code.
