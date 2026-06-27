# Changelog

All notable changes to Aurelion will be documented in this file.

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
