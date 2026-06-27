# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in Aurelion, please report it responsibly.

**Do not** open a public GitHub issue for security vulnerabilities.

Instead, email the maintainers directly with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if any)

We aim to acknowledge reports within 48 hours and provide a fix or mitigation plan within 7 days.

## Scope

The following are in scope:

- API authentication bypass
- Email data exposure to unauthorized users
- Injection attacks (SQL, HTML, script)
- Rate limit bypass
- KV storage manipulation
- Worker exploit vectors

## Out of Scope

- Denial of service attacks
- Social engineering
- Issues in third-party dependencies (report upstream)

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.1.x | Yes |
| 1.0.x | Yes |

## Security Measures

- API key authentication on all sensitive endpoints
- Rate limiting: 60 requests/minute per API key (KV sliding window)
- DOMPurify for email HTML sanitization (prevents XSS, script injection)
- Link security: all email links open with `target="_blank"` + `rel="noopener noreferrer"`
- Message deduplication on write to prevent data loss from race conditions
- JSON.parse wrapped in try/catch to prevent crash on corrupted KV data
- Clipboard operations with error handling and user feedback
- KV expiration for automatic data cleanup (15-minute TTL)
- Row-level security on database tables
- CORS headers on API responses
