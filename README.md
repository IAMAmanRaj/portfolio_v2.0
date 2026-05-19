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

**Roles (Admin/Author):**
- **ADMIN**: Can manage user accounts (create admins/authors, list authors, change roles with safeguards, and delete accounts with restrictions like “cannot delete yourself”).
- **AUTHOR**: Standard user role intended for content creation/usage; has no access to admin-only user management routes.
