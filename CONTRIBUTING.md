# Contributing to InfluencerToBe

Welcome to the team! This guide covers everything you need to work on this project effectively and conflict-free.

---

## Table of Contents

1. [First-Time Setup](#first-time-setup)
2. [Branching Strategy](#branching-strategy)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing](#testing)
6. [Pull Request Process](#pull-request-process)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Project Architecture](#project-architecture)
9. [Common Pitfalls](#common-pitfalls)

---

## First-Time Setup

### Prerequisites

- **Node.js** 22+ (`node -v`)
- **npm** 10+ (`npm -v`)
- **Git** 2.40+ (`git -v`)
- **PostgreSQL** 15+ (local or cloud instance)
- Access to the [GitHub repo](https://github.com/firasm101/influencer-to-be)

### Clone & Install

```bash
git clone https://github.com/firasm101/influencer-to-be.git
cd influencer-to-be
npm install          # installs deps + sets up Husky git hooks via "prepare"
```

### Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values. See `.env.example` for descriptions of each variable. Ask the team lead for shared dev credentials.

### Database Setup

```bash
npx prisma generate    # generate Prisma client
npx prisma db push     # sync schema to your database
```

### Verify Everything Works

```bash
npm run dev            # start dev server at http://localhost:3000
npm run test:all       # run all tests (144 tests, 11 suites)
npm run lint           # run ESLint
npm run format:check   # check Prettier formatting
npm run build          # verify production build
```

If all four pass, you're ready to go!

---

## Branching Strategy

We use a **feature-branch workflow**. No one pushes directly to `master`.

```
master (protected)
  |
  +-- feature/add-youtube-support     (your feature branch)
  +-- fix/onboarding-crash            (bug fix branch)
  +-- chore/update-dependencies       (maintenance branch)
```

### Branch Naming Convention

| Type     | Pattern                        | Example                       |
| -------- | ------------------------------ | ----------------------------- |
| Feature  | `feature/<short-description>`  | `feature/add-youtube-support` |
| Bug fix  | `fix/<short-description>`      | `fix/onboarding-crash`        |
| Chore    | `chore/<short-description>`    | `chore/update-dependencies`   |
| Refactor | `refactor/<short-description>` | `refactor/auth-module`        |
| Docs     | `docs/<short-description>`     | `docs/api-documentation`      |
| Test     | `test/<short-description>`     | `test/add-integration-tests`  |

### Rules

- **`master`** is always deployable. It auto-deploys to Railway on every merge.
- **Never push directly to `master`** — all changes go through Pull Requests.
- **Delete branches** after merging (GitHub does this automatically if configured).

---

## Development Workflow

### Starting New Work

```bash
# 1. Make sure you're up to date
git checkout master
git pull origin master

# 2. Create a feature branch
git checkout -b feature/my-feature

# 3. Work on your changes...
#    (commit often with small, focused commits)

# 4. Push your branch
git push -u origin feature/my-feature

# 5. Open a Pull Request on GitHub
#    - Use the PR template
#    - Request review from a teammate
#    - Wait for CI to pass
```

### While Working

```bash
# Run dev server
npm run dev

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run all tests before pushing
npm run validate      # lint + format check + all tests
```

### Keeping Your Branch Up to Date

If `master` has moved ahead while you're working:

```bash
git checkout master
git pull origin master
git checkout feature/my-feature
git merge master
# Resolve any conflicts, then continue
```

> **Use merge, not rebase** for simplicity when working on shared branches.

---

## Code Standards

### TypeScript

- **Strict mode** is enabled — no `any` types without justification
- Use **path aliases**: `@/components/...`, `@/lib/...`, `@/types/...`
- Export types from `src/types/index.ts` for shared types
- Use `interface` for object shapes, `type` for unions/aliases

### React / Next.js

- Use **Server Components** by default (no `"use client"` unless needed)
- Client components go in `src/components/` with `"use client"` directive
- API routes use Next.js App Router convention: `src/app/api/<route>/route.ts`
- Use **shadcn/ui** components from `src/components/ui/` — don't build custom UI primitives

### Styling

- **Tailwind CSS v4** — utility-first, no custom CSS files unless necessary
- Use `cn()` from `@/lib/utils` for conditional class merging
- Dark mode: use `dark:` prefix (handled by `next-themes`)

### File Organization

```
src/
  app/              # Next.js pages and API routes
    (auth)/         # Auth-related pages (grouped route)
    (dashboard)/    # Dashboard pages (grouped route with layout)
    api/            # API route handlers
      __tests__/    # API route tests
  components/       # React components
    __tests__/      # Component tests
    ui/             # shadcn/ui primitives (don't edit directly)
  lib/              # Utilities, services, business logic
    __tests__/      # Lib tests
    social/         # Social media platform integrations
      __tests__/    # Social integration tests
  types/            # TypeScript type definitions
```

### Formatting & Linting

- **Prettier** auto-formats on commit (via Husky + lint-staged)
- **ESLint** catches code issues on commit
- Config files: `.prettierrc`, `eslint.config.mjs`
- Run manually: `npm run format` (fix) or `npm run format:check` (verify)

### Commit Messages

Use clear, descriptive commit messages:

```
<type>: <short description>

<optional body explaining why>
```

**Types**: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`

**Examples**:

```
feat: add YouTube as a supported platform
fix: resolve crash on onboarding when no platforms selected
test: add integration tests for discover API
chore: update dependencies to latest versions
docs: add API documentation for generate-post endpoint
```

---

## Testing

### Test Structure

| Directory                   | What it tests                | Runner             |
| --------------------------- | ---------------------------- | ------------------ |
| `src/app/api/__tests__/`    | API route handlers           | `npm test`         |
| `src/lib/__tests__/`        | Business logic utilities     | `npm test`         |
| `src/lib/social/__tests__/` | Social platform integrations | `npm test`         |
| `src/components/__tests__/` | React UI components          | `npm run test:all` |

### Test Commands

```bash
npm test              # Server-side tests only (runs in CI)
npm run test:all      # All tests including component tests
npm run test:watch    # Watch mode for development
```

### Why Two Test Commands?

Component tests use `jsdom` with React 19, which requires a CJS compatibility polyfill. The CI pipeline runs `npm test` (server-side only) for speed and stability. Use `npm run test:all` locally to verify component tests.

### Writing Tests

- **Name pattern**: `<component-name>.test.tsx` or `<module-name>.test.ts`
- **Location**: `__tests__/` directory next to the source code
- **Framework**: Jest + React Testing Library
- **Mocking**: Mock external dependencies (lucide-react icons, Radix UI, next-themes, etc.)

**Key gotcha**: shadcn/ui Select component (Radix-based) doesn't render in jsdom. Always mock `@/components/ui/select` in component tests. See `post-builder.test.tsx` for the pattern.

### Before You Push

Always run `npm run validate` to verify everything passes:

```bash
npm run validate      # runs: lint + format:check + test:all
```

---

## Pull Request Process

### 1. Create the PR

- Push your branch and open a PR against `master`
- Fill in the PR template (it's automatic)
- Assign a reviewer

### 2. PR Requirements

Before a PR can be merged:

- [ ] CI pipeline passes (GitHub Actions)
- [ ] At least 1 approval from a team member
- [ ] No unresolved review comments
- [ ] PR description explains **what** and **why**
- [ ] New features have tests
- [ ] No `console.log` or debug code left behind

### 3. Review Guidelines

When reviewing a PR:

- Check for correctness, readability, and test coverage
- Run the branch locally if the change is significant
- Be constructive — suggest improvements, don't just reject
- Approve and merge, or request changes with specific feedback

### 4. Merging

- Use **"Squash and merge"** for clean history
- Delete the branch after merging (GitHub does this automatically)
- The merge to `master` triggers automatic deployment to Railway

---

## CI/CD Pipeline

```
Push / PR to master
       |
       v
  GitHub Actions CI
  - npm ci
  - npm test (server-side tests)
       |
       v (on merge to master)
  Railway "Wait for CI"
       |
       v
  Railway Build
  - npx prisma generate
  - npm run build
       |
       v
  Railway Deploy
  - npx prisma db push
  - npm start
       |
       v
  Live at: https://influencer-to-be-production.up.railway.app
```

### What Triggers Deployments

| Event                  | CI Runs? | Deploys? |
| ---------------------- | -------- | -------- |
| Push to feature branch | No       | No       |
| PR to `master`         | Yes      | No       |
| Merge to `master`      | Yes      | Yes      |

---

## Project Architecture

### Tech Stack

| Layer       | Technology                             |
| ----------- | -------------------------------------- |
| Framework   | Next.js 16 (App Router)                |
| UI          | React 19 + shadcn/ui + Tailwind CSS v4 |
| Language    | TypeScript 5 (strict mode)             |
| Database    | PostgreSQL + Prisma ORM                |
| Auth        | NextAuth.js (Google OAuth)             |
| AI          | Anthropic Claude API                   |
| Social APIs | RapidAPI (Instagram, TikTok)           |
| Testing     | Jest + React Testing Library           |
| CI/CD       | GitHub Actions + Railway               |
| Icons       | Lucide React                           |
| Charts      | Recharts                               |
| Themes      | next-themes (light/dark/system)        |

### Key Files

| File                           | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `prisma/schema.prisma`         | Database schema (all models)        |
| `src/lib/auth.ts`              | NextAuth configuration              |
| `src/lib/claude.ts`            | Claude AI integration               |
| `src/lib/db.ts`                | Prisma database client singleton    |
| `src/types/index.ts`           | Shared TypeScript types             |
| `src/components/providers.tsx` | App-wide providers (session, theme) |
| `railway.toml`                 | Railway deployment configuration    |

### Supported Platforms

The app currently supports three social media platforms:

- **Instagram** — reels, carousels, static posts, stories
- **TikTok** — videos
- **LinkedIn** — articles, documents

Platform-specific code lives in `src/lib/social/`. When adding a new platform, update:

1. `src/types/index.ts` — Platform type union + PostType
2. `src/lib/social/<platform>.ts` — API integration
3. All UI components that render platform-specific content (search for existing platform names)
4. Tests for the new platform

---

## Common Pitfalls

### 1. Forgetting to run `npx prisma generate` after schema changes

If you modify `prisma/schema.prisma`, run `npx prisma generate` before starting the dev server.

### 2. React 19 CJS compatibility

The `jest.setup.ts` file includes a polyfill for `React.act`. Don't remove it.

### 3. shadcn/ui components in tests

Radix-based components (Select, Dialog, DropdownMenu) don't work in jsdom. Mock them with simple HTML elements. See existing test files for patterns.

### 4. Environment variables

Never commit `.env`. Always use `.env.example` as the reference. If you add a new env var, update `.env.example` too.

### 5. Direct pushes to master

`master` is protected. Always use feature branches and PRs. If you get a push rejection, you probably need to create a PR instead.

---

## Questions?

If something isn't covered here, ask the team. If you figure out something new, update this document!
