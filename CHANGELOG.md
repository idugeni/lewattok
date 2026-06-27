# Changelog

All notable changes to Aurelion will be documented in this file.

## [1.1.0] - 2026-06-28

### Security

- Replace regex HTML sanitizer with DOMPurify for proper XSS prevention
- Add `target="_blank"` + `rel="noopener noreferrer"` to all email HTML links
- Implement rate limiting (60 requests/minute per API key via KV sliding window)
- Fix KV race condition with message_id deduplication on write
- Wrap `JSON.parse` in try/catch in worker auth and admin functions
- Add clipboard error handling with user-friendly toast notifications

### Fixed

- TTL text now shows actual remaining time (e.g. "12m 34s") instead of static "15m"
- `handleCopyBody` now respects view mode (HTML strips tags, text copies plain)
- TTL progress bar color transitions (green → amber → red)

### Added

- Error boundary page (`error.tsx`)
- Loading skeleton page (`loading.tsx`)
- 404 not-found page (`not-found.tsx`)
- Shared types package (`shared/types.ts`) — single source of truth for `EmailMessage`
- DOMPurify for email HTML sanitization

### Changed

- Extract shared types to `shared/types.ts` (frontend re-exports, worker imports)
- Remove fabricated "1000 inboxes/day" rate limit from documentation

### Removed

- Dead code: `extractLocalPart` function, `prevCountRef` ref

## [1.0.0] - 2026-06-28

### Added

- Disposable email generation with 15-minute TTL
- Real-time inbox polling (every 4 seconds)
- HTML and plain text email rendering
- Web UI with dark mode
- REST API for programmatic access
- API key authentication
- Self-service API key generation (rate-limited)
- Admin API key management (generate, list, revoke)
- Cloudflare Worker email receiver
- Cloudflare Email Routing integration
- MX record and catch-all configuration script
- Keyboard navigation (arrow keys, Enter, Esc)
- Toast notifications (Sonner)
- Copy actions (address, sender, subject, body)
- TTL progress bar
- Message dropdown menu with actions
- Confirmation dialog for new address generation
- Error alerts with retry
- shadcn/ui component library (Badge, Tooltip, Tabs, Avatar, Alert, Dialog, DropdownMenu, Progress, Popover)

### Infrastructure

- Cloudflare Worker for email processing
- Cloudflare KV for message and key storage
- Supabase/PostgreSQL schema with auto-expiry (pg_cron)
- Next.js 16 frontend with App Router
- Tailwind CSS v4
