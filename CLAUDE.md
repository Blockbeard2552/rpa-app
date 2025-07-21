# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (starts Vite dev server)
- **Build**: `npm run build` (creates production build)
- **Preview**: `npm run preview` (previews production build)
- **Type checking**: `npm run check` (runs svelte-check with TypeScript)
- **Watch mode**: `npm run check:watch` (continuous type checking)
- **Linting**: `npm run lint` (runs Prettier and ESLint)
- **Formatting**: `npm run format` (formats code with Prettier)

## Architecture Overview

This is a SvelteKit application with Supabase authentication and database integration.

### Authentication Flow

- Uses Supabase Auth with server-side session management
- Authentication handled in `src/hooks.server.ts` with two main hooks:
  - `supabase`: Creates server client and session validation
  - `authGuard`: Protects `/private/*` routes and redirects authenticated users from login/register
- Session data flows through `+layout.server.ts` to client-side components

### State Management

- Uses Svelte 5's runes (`$state`) for reactivity
- Centralized user state in `src/lib/state/user-state.svelte.ts` using context API
- `UserState` class manages session, user data, orders, and user names
- Automatic data fetching on state updates

### Database Integration

- TypeScript types generated from Supabase schema in `src/lib/components/types/database.types.ts`
- Three main tables: `orders`, `user_names`, `books`
- Server-side database operations in route actions (login/register pages)

### Route Structure

- Public routes: `/`, `/login`, `/register`
- Protected routes: `/private/*` (requires authentication)
- Auth callback: `/auth/callback` (handles OAuth redirects)
- Dashboard: `/private/dashboard` (main user interface)

### Component Organization

- Reusable components in `src/lib/components/`
- Layout components: `Header.svelte`, `SideNavigation.svelte`
- Form components: `AuthForm.svelte`
- UI components: `Button.svelte`, `HeroSection.svelte`

### Path Aliases

Configured in `svelte.config.js`:

- `$components`: `src/lib/components`
- `$stores`: `src/lib/stores`
- `$utils`: `src/lib/utils`
- `$assets`: `src/assets`
- `$routes`: `src/routes`

### Key Dependencies

- **SvelteKit**: Full-stack framework
- **Supabase**: Authentication and database (`@supabase/supabase-js`, `@supabase/ssr`)
- **Lucide Svelte**: Icons (`@lucide/svelte`)
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
