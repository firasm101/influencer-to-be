# InfluencerToBe

AI-powered influencer analytics and content generation platform. Discover trending creators, analyze social media posts, and generate optimized content using Claude AI.

**Live**: [influencer-to-be-production.up.railway.app](https://influencer-to-be-production.up.railway.app)

---

## Tech Stack

| Layer       | Technology                               |
| ----------- | ---------------------------------------- |
| Framework   | Next.js 16 (App Router)                  |
| UI          | React 19, shadcn/ui, Tailwind CSS v4     |
| Language    | TypeScript 5 (strict)                    |
| Database    | PostgreSQL + Prisma ORM                  |
| Auth        | NextAuth.js (Google OAuth)               |
| AI          | Anthropic Claude API                     |
| Social APIs | RapidAPI (Instagram, TikTok)             |
| Testing     | Jest + React Testing Library (144 tests) |
| CI/CD       | GitHub Actions + Railway                 |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/firasm101/influencer-to-be.git
cd influencer-to-be

# 2. Install (also sets up git hooks)
npm install

# 3. Configure environment
cp .env.example .env
# Fill in your values — see .env.example for details

# 4. Set up database
npx prisma generate
npx prisma db push

# 5. Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command                | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Start development server              |
| `npm run build`        | Production build                      |
| `npm start`            | Start production server               |
| `npm test`             | Run server-side tests (CI)            |
| `npm run test:all`     | Run all tests including UI components |
| `npm run test:watch`   | Run tests in watch mode               |
| `npm run lint`         | Run ESLint                            |
| `npm run format`       | Format code with Prettier             |
| `npm run format:check` | Check formatting without modifying    |
| `npm run validate`     | Run lint + format check + all tests   |

---

## Project Structure

```
src/
  app/                  # Pages and API routes (Next.js App Router)
    (auth)/             # Login page
    (dashboard)/        # Dashboard, Discover, Insights, Build, Settings
    api/                # REST API endpoints
      __tests__/        # API route tests
  components/           # React components
    __tests__/          # Component tests
    ui/                 # shadcn/ui primitives
  lib/                  # Business logic, services, utilities
    __tests__/          # Lib tests
    social/             # Platform-specific integrations
      __tests__/        # Social integration tests
  types/                # Shared TypeScript type definitions
prisma/
  schema.prisma         # Database schema
```

---

## Team Development Workflow

We use a **feature-branch workflow** with protected `master` branch.

```
master (protected, auto-deploys to Railway)
  |
  +-- feature/my-feature     ← your work goes here
  +-- fix/some-bug
  +-- chore/update-deps
```

### The Flow

1. **Branch** off `master` with a descriptive name
2. **Code** your changes (commit often)
3. **Validate** locally: `npm run validate`
4. **Push** your branch and open a **Pull Request**
5. **Review** — get at least 1 approval
6. **Merge** — CI passes, squash merge into `master`
7. **Deploy** — automatic via Railway

### Pre-commit Hooks

Every commit automatically runs **Prettier** and **ESLint** on staged files via Husky + lint-staged. No need to think about formatting.

### Full Guide

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for:

- Detailed setup instructions
- Branch naming conventions
- Code standards and patterns
- Testing guide
- PR process
- Architecture deep dive
- Common pitfalls

---

## CI/CD Pipeline

```
PR / Push to master
     |
     v
GitHub Actions
  - npm ci
  - npm test
     |
     v (merge to master)
Railway
  - prisma generate + build
  - prisma db push + start
     |
     v
Live at production URL
```

---

## Supported Platforms

| Platform  | Content Types                     |
| --------- | --------------------------------- |
| Instagram | Reels, Carousels, Static, Stories |
| TikTok    | Videos                            |
| LinkedIn  | Articles, Documents               |

---

## License

Private project.
