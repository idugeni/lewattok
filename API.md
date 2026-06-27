# Aurelion API Reference

Base URL: `https://aurelion-email-worker.officialelsa21516.workers.dev`

## Authentication

All endpoints (except public key generation) require an API key passed via the `X-API-Key` header.

```
X-API-Key: al_a805d555d3b875d4a88605219bae4a6261babddebfc1f8c9
```

Key format: `al_` prefix + 48 hex characters.

---

## Generate Inbox

Create a new disposable email address.

```
POST /api/v1/inboxes
```

**Headers:**
- `X-API-Key` (required)

**Response (201):**

```json
{
  "address": "bold.wave4404@aurelion.web.id"
}
```

---

## Retrieve Messages

Fetch messages for a specific inbox. Messages expire after 15 minutes.

### Query style

```
GET /api/v1/messages?recipient={email}&since={iso_date}
```

### Path style

```
GET /api/v1/inboxes/{email}/messages?since={iso_date}
```

**Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `recipient` | Yes | The email address to fetch messages for |
| `since` | No | ISO 8601 timestamp — only return messages after this time |

**Headers:**
- `X-API-Key` (required)

**Response (200):**

```json
{
  "messages": [
    {
      "id": "uuid",
      "message_id": "uuid",
      "recipient": "bold.wave4404@aurelion.web.id",
      "sender": "sender@example.com",
      "subject": "Hello!",
      "body_text": "Plain text content...",
      "body_html": "<html>...</html>",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Notes:**
- Maximum 50 messages returned per request
- Messages are sorted by `created_at` descending
- Use `since` for efficient polling (returns only new messages)

---

## Self-Service Key Generation

Generate an API key without admin access. Rate-limited to one key per IP per hour.

```
POST /api/v1/public/key
```

**Headers:** None required

**Response (201):**

```json
{
  "key": "al_a805d555d3b875d4a88605219bae4a6261babddebfc1f8c9",
  "name": "",
  "source": "public",
  "created": "2024-01-01T00:00:00.000Z",
  "expires_at": "2024-01-31T00:00:00.000Z",
  "last_used": null
}
```

**Notes:**
- Keys expire after 30 days
- Rate limit: 1 key per IP per hour

---

## Admin: API Key Management

All admin endpoints require the master API key.

### Generate Key

```
POST /api/v1/admin/keys?ttl={seconds}
```

**Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `ttl` | No | Key lifetime in seconds (no TTL if omitted) |

**Response (201):**

```json
{
  "key": "al_a805d555d3b875d4a88605219bae4a6261babddebfc1f8c9",
  "name": "",
  "created": "2024-01-01T00:00:00.000Z",
  "last_used": null
}
```

### List Keys

```
GET /api/v1/admin/keys
```

**Response (200):**

```json
{
  "keys": [
    {
      "key": "al_a805...",
      "name": "",
      "created": "2024-01-01T00:00:00.000Z",
      "expires_at": null,
      "last_used": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

**Note:** Full keys are truncated for security in list responses.

### Revoke Key

```
DELETE /api/v1/admin/keys
```

**Body:**

```json
{
  "key": "al_a805d555d3b875d4a88605219bae4a6261babddebfc1f8c9"
}
```

**Response (200):**

```json
{
  "revoked": "al_a805d555d3b875d4a88605219bae4a6261babddebfc1f8c9"
}
```

---

## Legacy Endpoints

These endpoints are available without authentication (used by the web UI):

### Generate Address

```
GET /api/generate
```

**Response (200):**

```json
{
  "address": "bold.wave4404@aurelion.web.id"
}
```

### Get Messages (Legacy)

```
GET /api/messages?recipient={email}&since={iso_date}
```

**Response (200):**

```json
{
  "messages": [...]
}
```

---

## Rate Limits

| Limit | Scope | Window |
|-------|-------|--------|
| 60 requests | Per API key | 1 minute |
| 1000 inboxes | Per API key | 1 day |
| 1 key | Per IP | 1 hour (public endpoint only) |

Exceeding limits returns `429 Too Many Requests`.

---

## Error Format

All errors return:

```json
{
  "error": "Error message"
}
```

| Code | Meaning |
|------|---------|
| 400 | Missing or invalid parameters |
| 401 | Invalid or missing API key |
| 405 | HTTP method not allowed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
