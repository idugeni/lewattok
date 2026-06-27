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
| 1.0.x | Yes |

## Security Measures

- API key authentication on all sensitive endpoints
- Rate limiting on key generation and API requests
- HTML sanitization on email rendering
- Script and iframe stripping from email content
- KV expiration for automatic data cleanup
- Row-level security on database tables
- CORS headers on API responses
