# Leja

Nigeria's residential rental transaction platform. Replaces informal estate agents with a structured digital layer for agreements, payments, and legal protection.

## Prerequisites

- **Node.js** 18+ (verify with `node --version`)
- **npm** 10+ (verify with `npm --version`)
- PostgreSQL database (Supabase or local instance)
- Paystack account (for payments)

## Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd leja
npm install
```

### 2. Environment Setup

Copy the example env file and fill in your actual values:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

**Required environment variables:**
- `DATABASE_URL` — PostgreSQL connection string
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `JWT_SECRET` — Secret for JWT signing (generate a random string)
- `PAYSTACK_SECRET_KEY` — Paystack secret key
- `PAYSTACK_PUBLIC_KEY` — Paystack public key
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — Frontend Paystack key
- `NEXT_PUBLIC_API_URL` — Frontend API URL (e.g., `http://localhost:5000/api/v1`)
- `NODE_ENV` — `development` or `production`
- `PORT` — API port (default `5000`)

### 3. Setup Database

```bash
# Run the schema and seed
psql $DATABASE_URL < apps/api/src/db/schema.sql
psql $DATABASE_URL < apps/api/src/db/seed.sql
```

### 4. Run Development Servers

```bash
npm run dev
```

This starts:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000/api/v1

### 5. Test With Sample Data

Use the seed data to login:
- **Landlord:** `landlord@example.com` / password
- **Tenant:** `tenant1@example.com` / password

## Monorepo Structure

```
leja/
├── apps/
│   ├── api/          # Express backend (Node.js + TypeScript)
│   └── web/          # Next.js frontend (React + TypeScript)
├── packages/
│   └── shared/       # @leja/shared types and utilities
├── turbo.json        # Turborepo configuration
└── package.json      # Root workspace configuration
```

### apps/api

Express.js backend with PostgreSQL. Runs on port 5000.

**Key directories:**
- `src/routes/` — API endpoint handlers
- `src/middleware/` — Auth, rate limiting, validation
- `src/lib/` — JWT, Paystack integrations
- `src/db/` — Database schema and seed data

**Start with:** `npm run dev` (from root)

### apps/web

Next.js 14 frontend with App Router and Tailwind CSS. Runs on port 3000.

**Key directories:**
- `src/app/` — Pages and layouts
- `src/components/` — Reusable UI components
- `src/lib/` — API client, utilities
- `src/hooks/` — Custom React hooks (useAuth)

**Start with:** `npm run dev` (from root)

### packages/shared

Shared TypeScript types used by both frontend and backend.

**Includes:**
- User, Property, Agreement, Payment, RentalHistory types
- Enums (UserRole, PropertyType, AgreementStatus, etc.)
- API response shapes (ApiResponse, PaginatedResponse)

## Development Commands

```bash
# Start dev servers (all)
npm run dev

# Build all packages
npm run build

# Run type checking
npm run type-check

# Clean build artifacts
npm run clean
```

## API Documentation

All routes are prefixed with `/api/v1`.

### Auth Routes (`/api/v1/auth`)
- `POST /register` — Create new account
- `POST /login` — Login with email/password
- `GET /me` — Get current user (requires token)

### Users Routes (`/api/v1/users`)
- `GET /profile` — Get own profile
- `PATCH /profile` — Update profile
- `GET /:id/rental-history` — Get a tenant's rental history

### Properties Routes (`/api/v1/properties`)
- `POST /` — Create property (landlord only)
- `GET /` — List available properties (paginated)
- `GET /:id` — Get single property
- `PATCH /:id` — Update property (landlord only)
- `DELETE /:id` — Soft delete property (landlord only)

### Agreements Routes (`/api/v1/agreements`)
- `POST /` — Create agreement draft
- `GET /` — List own agreements
- `GET /:id` — Get single agreement
- `POST /:id/request-lawyer-review` — Request lawyer review
- `PATCH /:id/status` — Update agreement status

### Payments Routes (`/api/v1/payments`)
- `POST /webhook` — Paystack webhook handler
- `POST /verify/:reference` — Verify payment

### Rental History Routes (`/api/v1/rental-history`)
- `GET /mine` — Get own rental history (tenant only)
- `GET /export` — Export rental history (tenant only)

## Key Concepts

### Money
- Stored in database as **Naira** (₦) with 2 decimal places
- Converted to **kobo** (₦ × 100) when calling Paystack API
- Displayed to users in Naira format

### Authentication
- JWT tokens valid for 7 days
- Stored in httpOnly cookies on frontend
- Passed as `Authorization: Bearer <token>` in API requests

### Agreement Workflow
1. Landlord creates agreement draft (₦3,500)
2. Optional lawyer review upgrade (₦12,000 total)
3. Paystack payment processed
4. Webhook confirms payment
5. Agreement status changes to ACTIVE
6. Both parties can view agreement

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Paystack Integration](https://paystack.com/docs/)
- [Supabase](https://supabase.com/docs/)

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (web)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000 (api)
lsof -ti:5000 | xargs kill -9
```

### Database Connection Failed
- Verify `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running
- Check Supabase credentials

### Module Import Errors
- Run `npm install` to ensure all dependencies are installed
- Check that `@leja/shared` package was built: `npm run build`
- Verify tsconfig paths (apps/web should have `@/*` → `./src/*`)

## License

MIT
