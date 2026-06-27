# Aurelion

Temporary email that vanishes in 15 minutes. Generate a disposable address, receive emails in real-time, and let everything auto-delete after the timer expires.

## Getting Started

### 1. Generate an Address

Open the app — a new disposable email address is created automatically. No signup, no waiting.

Your address looks like `bold.wave4404@aurelion.web.id` — a random adjective, noun, and number.

### 2. Use It

Copy the address and use it wherever you need a temporary email:

- Sign up for services
- Verify accounts
- Test email flows
- Protect your real inbox

### 3. Read Messages

Incoming emails appear in your inbox automatically. The app polls every 4 seconds, so messages show up within moments.

Click any message to read it. Toggle between **HTML** and **Text** view using the tabs at the top.

### 4. Watch It Vanish

After 15 minutes, the address and all messages are permanently deleted. A progress bar at the top of your sidebar shows the remaining time.

## Web UI

### Sidebar

| Feature | Description |
|---------|-------------|
| **Address** | Click to copy your disposable email |
| **New** | Generate a new address (confirms before resetting) |
| **Message list** | Click to read, or right-click for actions |
| **TTL bar** | Shows remaining time before expiry |
| **Message count** | Badge showing how many emails you've received |

### Message View

| Feature | Description |
|---------|-------------|
| **Sender / Recipient** | Click to copy |
| **HTML / Text tabs** | Switch between rendered and plain text |
| **Menu (⋮)** | Copy sender, recipient, subject, body, or full message |
| **Close (×)** | Return to inbox |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` | Navigate between messages |
| `Enter` | Open selected message |
| `Esc` | Close message / go back |

### Right-Click Menu

Right-click any message in the sidebar for quick actions:

- **Open message** — View the full email
- **Copy sender** — Copy the sender's address
- **Copy subject** — Copy the email subject
- **Copy full content** — Copy sender, subject, and body

## API

Aurelion provides a full REST API for programmatic access.

### Base URL

```
https://aurelion-email-worker.officialelsa21516.workers.dev
```

### Authentication

All API requests require an API key via the `X-API-Key` header:

```
X-API-Key: al_a805d555d3b875d4a88605219bae4a6261babddebfc1f8c9
```

**Get a free key** — Visit the `/docs` page in the app and click "Get your API key". Rate-limited to one key per IP per hour.

### Generate an Inbox

```bash
curl -X POST https://your-worker.workers.dev/api/v1/inboxes \
  -H "X-API-Key: your_api_key"
```

**Response:**

```json
{
  "address": "bold.wave4404@aurelion.web.id"
}
```

### Retrieve Messages

```bash
curl "https://your-worker.workers.dev/api/v1/messages?recipient=bold.wave4404@aurelion.web.id" \
  -H "X-API-Key: your_api_key"
```

**With polling (only new messages):**

```bash
curl "https://your-worker.workers.dev/api/v1/messages?recipient=bold.wave4404@aurelion.web.id&since=2024-01-01T00:00:00.000Z" \
  -H "X-API-Key: your_api_key"
```

**Response:**

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

### Quick Start (JavaScript)

```javascript
const BASE = "https://your-worker.workers.dev";
const KEY = "your_api_key";

// Create inbox
const { address } = await fetch(`${BASE}/api/v1/inboxes`, {
  method: "POST",
  headers: { "X-API-Key": KEY }
}).then(r => r.json());

console.log(address); // "bold.wave4404@aurelion.web.id"

// Get messages
const { messages } = await fetch(`${BASE}/api/v1/messages?recipient=${address}`, {
  headers: { "X-API-Key": KEY }
}).then(r => r.json());

console.log(messages); // [...]
```

### Quick Start (Python)

```python
import requests

BASE = "https://your-worker.workers.dev"
KEY = "your_api_key"

# Create inbox
res = requests.post(f"{BASE}/api/v1/inboxes", headers={"X-API-Key": KEY})
address = res.json()["address"]
print(address)  # "bold.wave4404@aurelion.web.id"

# Get messages
res = requests.get(f"{BASE}/api/v1/messages?recipient={address}", headers={"X-API-Key": KEY})
messages = res.json()["messages"]
print(messages)  # [...]
```

### Self-Service Key Generation

No admin needed. Generate a key directly:

```bash
curl -X POST https://your-worker.workers.dev/api/v1/public/key
```

**Response:**

```json
{
  "key": "al_a805d555d3b875d4a88605219bae4a6261babddebfc1f8c9",
  "expires_at": "2024-01-31T00:00:00.000Z"
}
```

Keys expire after 30 days. One key per IP per hour.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/inboxes` | Generate a new disposable address |
| `GET` | `/api/v1/messages?recipient=...` | Retrieve messages for an inbox |
| `GET` | `/api/v1/inboxes/:email/messages` | Retrieve messages (path style) |
| `POST` | `/api/v1/public/key` | Self-service API key generation |
| `POST` | `/api/v1/admin/keys` | Generate an API key (master key required) |
| `GET` | `/api/v1/admin/keys` | List all API keys (master key required) |
| `DELETE` | `/api/v1/admin/keys` | Revoke an API key (master key required) |

### Rate Limits

| Limit | Scope | Window |
|-------|-------|--------|
| 60 requests | Per API key | 1 minute |
| 1000 inboxes | Per API key | 1 day |
| 1 key | Per IP | 1 hour (public endpoint only) |

### Error Responses

All errors return a JSON body:

```json
{ "error": "Invalid or missing API key" }
```

| Code | Meaning |
|------|---------|
| 400 | Missing or invalid parameters |
| 401 | Invalid or missing API key |
| 405 | HTTP method not allowed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## How Emails Are Processed

1. An email is sent to your disposable address
2. Cloudflare Email Routing catches it via a catch-all rule
3. The Cloudflare Worker receives the email
4. The Worker parses the MIME content (subject, text body, HTML body)
5. The parsed message is stored in Cloudflare KV with a 15-minute TTL
6. When you poll the API, messages are returned from KV
7. After 15 minutes, KV automatically expires the data
