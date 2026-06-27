# Contributing to Aurelion

Thanks for your interest in contributing! Here's how to get started.

## Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run tests and lint
5. Commit with a clear message
6. Push and open a pull request

## Project Layout

| Directory | Purpose |
|-----------|---------|
| `frontend/` | Next.js web app (UI, API routes) |
| `worker/` | Cloudflare Worker (email receiver, REST API) |
| `database/` | SQL schemas for Supabase/PostgreSQL |
| `scripts/` | Cloudflare setup automation |

## Common Tasks

### Adding a UI component

1. Install via shadcn: `npx shadcn@latest add <component>`
2. Import from `@/components/ui/<component>`
3. Follow existing patterns in `components/`

### Adding an API endpoint

1. Worker endpoints go in `worker/src/index.ts`
2. Frontend proxy routes go in `frontend/app/api/`
3. Add types to `frontend/lib/types.ts`

### Running tests

```bash
cd worker
npm test
```

### Linting

```bash
cd frontend
npm run lint
```

## Code Style

- TypeScript strict mode
- Tailwind CSS for styling
- shadcn/ui component patterns
- No inline comments unless requested
- Prefer named exports

## Commit Messages

Use conventional commits:

- `feat: add message search`
- `fix: resolve polling race condition`
- `docs: update API reference`
- `refactor: extract email parser`

## Pull Requests

- Keep PRs focused on a single change
- Include a description of what changed and why
- Make sure `npm run lint` and `npm test` pass
- Request a review from a maintainer

## Questions?

Open an issue or start a discussion.
