# TaskFlow

A full-stack task manager: React, Node/Express, and PostgreSQL.
Built to learn the stack properly — not from a tutorial.

**Status:** Phase 2 — project setup

## Planned
- [x] REST API for tasks
- [x] PostgreSQL via Prisma
- [x] JWT authentication
- [ ] React frontend
- [ ] Projects and team members
- [ ] Deployed

## Authentication

- `POST /api/auth/register` — bcrypt hash (cost 12), returns id and email only
- `POST /api/auth/login` — verifies the hash, returns a JWT signed with `JWT_SECRET`, 7-day expiry
- `requireAuth` middleware verifies the `Bearer` token and attaches `userId` to the request
- Every task route filters by that `userId`; another user's task returns 404, not 403,
  so row existence isn't leaked
