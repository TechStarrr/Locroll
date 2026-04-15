# Locroll

**On-chain payroll infrastructure for modern teams.**  
Locroll lets companies invite employees, provision self-custody wallets, and run USDC payroll in seconds — all from a single dashboard.

---

## Overview

Locroll is a full-stack Next.js application that combines:
- **Privy** for employer authentication and employee wallet provisioning
- **Locus** for on-chain USDC payment execution
- **PostgreSQL + Prisma** for persistent, production-grade data storage
---

## Features

| Feature | Description |
|---|---|
| Employer onboarding | Create a company profile linked to your Privy account |
| Employee management | Add employees individually or bulk-import via CSV |
| Invite links | Unique `/invite/[token]` links provision employee embedded wallets |
| Payroll execution | Run on-chain USDC payroll to wallet addresses or email escrow |
| Compliance dashboard | KYC status tracking and full audit log |
| Treasury balance | Live USDC balance pulled from the Locus API |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.3 (App Router, TypeScript) |
| Auth | Privy (`@privy-io/react-auth` v3) |
| Payments | Locus API (`/api/pay/send`, `/api/pay/send-email`) |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| Styling | Tailwind CSS v4 |


---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── audit/            # GET audit log (cookie-auth)
│   │   ├── company/          # GET/POST company + sets HttpOnly cookie
│   │   ├── employees/        # CRUD + bulk CSV import
│   │   ├── locus/balance/    # Proxies Locus balance API
│   │   └── payroll/run/      # Execute payroll + persist to DB
│   ├── dashboard/
│   │   ├── page.tsx          # Overview: balance, team size, recent runs
│   │   ├── employees/        # Employee list + CSV import
│   │   ├── payroll/          # Payroll builder + history
│   │   └── compliance/       # KYC status + audit log
│   ├── invite/[token]/       # Employee onboarding + wallet provisioning
│   ├── login/                # Privy auth entry point
│   └── onboarding/           # Company setup (first run)
├── lib/
│   ├── db.ts                 # PrismaClient singleton (pg adapter)
│   └── locus.ts              # Locus API client
prisma/
├── schema.prisma             # 5 models: Company, Employee, PayrollRun, PayrollLine, AuditLog
└── migrations/               # SQL migration history
```

---

## Database Schema

```prisma
Company       — id, name, size, privyUserId (unique)
Employee      — id, companyId, firstName, lastName, email, inviteToken, walletAddress, status
PayrollRun    — id, companyId, total, currency, status
PayrollLine   — id, payrollRunId, employeeId, name, email, amount, walletAddress
AuditLog      — id, companyId, payrollRunId, type, count, total, currency
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 running locally (default port `5433` on this machine)
- A [Privy](https://privy.io) app with embedded wallets enabled
- A [Locus](https://paywithlocus.com) account and API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file at the project root:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/locroll?schema=public"
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret
API_KEY=your_locus_api_key
EMAIL=your_locus_account_email
```

### 3. Set up the database

```bash
# Create the database
createdb locroll

# Apply migrations
npx prisma migrate dev

# (Re)generate the Prisma client
npx prisma generate
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Authentication Flow

```
1. Employer visits /login → authenticates with Privy
2. POST /api/company creates Company row in DB
   └─ Server sets HttpOnly cookie: locroll_cid=<company.id>
3. All subsequent API calls carry the cookie automatically
   └─ Routes read req.cookies.get("locroll_cid") — no client state required
```

## Employee Onboarding Flow

```
1. Employer adds employee → unique invite link generated (/invite/<token>)
2. Employee clicks link → authenticates with Privy
3. Privy provisions an embedded wallet for the employee
4. PATCH /api/employees/[id] stores walletAddress + privyUserId
5. Employee status → "active" — ready for payroll
```

## Payroll Flow

```
1. Employer selects amounts on /dashboard/payroll
2. POST /api/payroll/run:
   a. Creates PayrollRun + PayrollLine records in DB
   b. Calls Locus API (send-email or send per employee)
   c. Updates run status (completed / partial / failed)
   d. Writes AuditLog entry
```

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/company` | Privy user ID | Lookup company, set cookie |
| POST | `/api/company` | — | Create company, set cookie |
| DELETE | `/api/company` | — | Clear session cookie |
| GET | `/api/employees` | Cookie | List employees |
| POST | `/api/employees` | Cookie | Create employee |
| GET | `/api/employees/[id]` | — | Get employee |
| PATCH | `/api/employees/[id]` | — | Update status/wallet |
| POST | `/api/employees/bulk` | Cookie | CSV bulk import |
| GET | `/api/employees/by-token/[token]` | — | Lookup by invite token |
| GET | `/api/payroll/run` | Cookie | List payroll runs |
| POST | `/api/payroll/run` | Cookie | Execute payroll |
| GET | `/api/audit` | Cookie | Get audit log |
| GET | `/api/locus/balance` | — | Treasury USDC balance |

---

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npx prisma studio  # Open Prisma data browser
npx prisma migrate dev --name <name>  # Create and apply a migration
```

