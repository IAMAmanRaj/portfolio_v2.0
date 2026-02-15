# Portfolio v2.0

**Frontend:**
- React + TypeScript
- TailwindCSS
- TanStack Query
- Vite

**Backend:**
- Node.js + Express
- TypeScript
- Prisma (ORM)
- Supabase PostgreSQL

**Backend Architecture:**
- Express server exposes RESTful API endpoints for frontend consumption
- Database access through Prisma ORM with dual connection strategy:
  - Transaction pooler (high concurrency) handles all runtime queries
  - Session pooler (session state) required for schema migrations
- Singleton Prisma client instance exported from `src/lib/db.ts` for application-wide use