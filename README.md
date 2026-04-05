# CardLearner

Mobile-first language learning MVP scaffold built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase Auth.

## Getting Started

1. Install dependencies.

```bash
npm install
```

2. Create `.env.local` from the example file.

```bash
Copy-Item .env.example .env.local
```

3. Fill in the required Supabase environment variables.

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=your-pooled-prisma-connection-string
DIRECT_URL=your-direct-connection-string
```

4. Start the development server.

```bash
npm run dev
```

Open `http://localhost:3000`.

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL from the dashboard API settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public anon key from the dashboard API settings
- `DATABASE_URL`: pooled Supabase Postgres connection string used by Prisma Client
- `DIRECT_URL`: direct Supabase Postgres connection string used by Prisma migrations

## Supabase Setup Steps

1. Create a project in Supabase.
2. Open `Project Settings -> API`.
3. Copy the project URL into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the anon public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Open `Authentication -> Sign In / Providers` and enable `Email`.
6. Open `Authentication -> URL Configuration`.
7. Set `Site URL` to `http://localhost:3000` for local development.
8. Add `http://localhost:3000/auth/callback` as an allowed redirect URL.

## Prisma Setup

1. In Supabase, open `Project Settings -> Database`.
2. Copy the Prisma-compatible pooled connection string into `DATABASE_URL`.
3. Copy the direct connection string into `DIRECT_URL`.
4. Ensure the pooled connection string includes `?pgbouncer=true&connection_limit=1` when using Supabase pooler values intended for Prisma.
5. Keep `DIRECT_URL` pointed at the direct database host so Prisma migrations and schema operations bypass the pooler.
6. Generate the Prisma client after editing the schema:

```bash
npm run prisma:generate
```

7. Create and apply a migration locally:

```bash
npm run prisma:migrate -- --name init_lists
```

8. Optionally inspect data with Prisma Studio:

```bash
npm run prisma:studio
```

## How Auth Currently Works

- Email/password signup is handled by Supabase Auth.
- Email/password login is handled by Supabase Auth.
- Logout is handled through a server action in the authenticated app shell.
- Middleware protects `/lists` and `/study`.
- Unauthenticated users are redirected to `/login`.
- Authenticated users visiting `/login` or `/signup` are redirected to `/lists`.
- `/lists` shows the current signed-in email as a simple auth confirmation.
- If email confirmation is enabled in Supabase, signup shows a confirmation message and the email link returns through `/auth/callback`.

## Database Layer

- Prisma is configured against Supabase Postgres in `prisma/schema.prisma`.
- App data uses the authenticated Supabase Auth user id as `List.userId`.
- Prisma does not create or own Supabase auth tables.
- `List` has many `ListItem` records.
- `ListItem.position` preserves item order inside a list.
- Every repository helper requires a `userId` and scopes reads and writes by ownership.
- `/lists` now reads the current authenticated user's lists from the database.

## Current Project Structure

```text
src/
  app/
    (app)/
      lists/
        [listId]/
          edit/page.tsx
          page.tsx
        new/page.tsx
        page.tsx
      study/
        results/page.tsx
        session/page.tsx
        setup/page.tsx
      layout.tsx
    (auth)/
      login/page.tsx
      signup/page.tsx
      layout.tsx
    actions/
      auth.ts
    auth/
      callback/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    auth/
      auth-form.tsx
    layout/
      app-shell.tsx
      header.tsx
      mobile-nav.tsx
    ui/
      placeholder-card.tsx
      placeholder-screen.tsx
      section-intro.tsx
  lib/
    data/
      lists.ts
    lists/
      parse-list-items.ts
    prisma.ts
    supabase/
      client.ts
      env.ts
      middleware.ts
      server.ts
      session.ts
      types.ts
    utils.ts
middleware.ts
prisma/
  schema.prisma
```

## Notes

- `src/lib/supabase/client.ts` is the reusable browser/client helper.
- `src/lib/supabase/server.ts` is the reusable server helper for App Router code.
- `src/lib/supabase/session.ts` centralizes user and session access.
- `src/app/actions/auth.ts` contains the login, signup, and logout server actions.
- `src/lib/prisma.ts` exposes the reusable Prisma client singleton for Next.js.
- `src/lib/data/lists.ts` contains the user-scoped list repository helpers for future CRUD work.
- `src/lib/lists/parse-list-items.ts` parses multiline `front % back` content into ordered list items.
- `middleware.ts` applies route protection before protected pages render.
- `components.json` and `src/lib/utils.ts` still prepare the codebase for future `shadcn/ui` integration.

## Still To Be Implemented

- password reset
- social auth
- list CRUD
- study flow logic
