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
- Database access through Prisma ORM; migrations run against the main database (no shadow database)
- Singleton Prisma client instance exported from `src/lib/db.ts` for application-wide use