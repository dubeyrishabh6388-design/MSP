# Serviqa — Multi-Service Marketplace Platform

> A production-grade, extensible multi-service marketplace connecting homeowners and businesses with background-verified trade professionals.

---

## 1. Product Architecture & Stack

- **Frontend (`apps/web`)**: React 18, TypeScript (Strict), Vite, Tailwind CSS (warm orange accent `#ea580c`), TanStack Query v5, React Router v6, Lucide React icons.
- **Backend (`apps/api`)**: Node.js, Express, TypeScript, REST API (`/api/v1`), Prisma ORM 5, MySQL 8.4 (`serviqa_db`).
- **Shared Contracts (`packages/shared`)**: Shared TypeScript interfaces, state machine transitions, enums, category field definitions.
- **Containerization**: Multi-stage Dockerfiles and `docker-compose.yml` for local container reproducibility.
- **Testing**: Vitest, React Testing Library, Supertest integration test suite.

---

## 2. Seeded Personas & Test Credentials

The database is pre-seeded with realistic, operational multi-category data. You can log in using these accounts or use the **"One-Click Demo Persona"** dropdown in the navbar:

| Role | Email | Password | Details |
|---|---|---|---|
| **System Admin** | `admin@serviqa.com` | `admin123` | Full administrative operations, verification approval, category schema, dispute mediation |
| **Support Staff** | `support@serviqa.com` | `password123` | Dispute handling & ticket triage |
| **Customer 1** | `rahul.sharma@example.com` | `password123` | Rahul Sharma (Saket, New Delhi) — Active AC & Electrician bookings |
| **Customer 2** | `priya.patel@example.com` | `password123` | Priya Patel (Indiranagar, Bangalore) — Active 2 BHK Moving request with quotations |
| **Provider 1** | `rajesh.ac@example.com` | `password123` | Rajesh Kumar (CoolCare HVAC) — Verified, 4.9 rating, AC & Appliance repair specialist |
| **Provider 2** | `vikram.movers@example.com` | `password123` | Vikram Singh (Speedy Logistics) — Verified, 4.8 rating, Packers & Movers |
| **Provider 3** | `sunil.electric@example.com` | `password123` | Sunil Verma (Spark Electric & Plumbing) — Verified electrician |

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js 20+
- MySQL 8.0+ running on port `3306` (or Docker)

### Installation & Database Setup
```bash
# 1. Install all monorepo dependencies
npm install

# 2. Build shared contracts
npm run build --workspace=@serviqa/shared

# 3. Synchronize database schema and seed data
cd apps/api
npx prisma db push
npm run seed
cd ../..
```

### Running the Services
In terminal 1 (Backend API):
```bash
npm run dev:api
# Running on http://localhost:5000
# OpenAPI Specification available at: http://localhost:5000/api/v1/openapi.json
# Health check: http://localhost:5000/api/health
```

In terminal 2 (Frontend Client):
```bash
npm run dev:web
# Running on http://localhost:5173
```

---

## 4. Running Automated Tests

Run the complete test suite across backend API endpoints and frontend components:
```bash
npm run test
```

Expected result:
- Backend: 7 passed tests (Auth, RBAC, Dynamic Category Fields, Rewards breakdown, Business Analytics)
- Frontend: 3 passed component tests (Lifecycle StatusBadges, visual state classes)

---

## 5. Booking Lifecycle State Machine

```
REQUESTED 
  → MATCHING 
  → QUOTATIONS_RECEIVED 
  → PROVIDER_SELECTED 
  → CONFIRMED 
  → PROVIDER_EN_ROUTE 
  → IN_PROGRESS 
  → COMPLETION_SUBMITTED 
  → COMPLETED
```
- **Concurrency Protection**: Atomic database transactions prevent multiple providers from simultaneously claiming exclusive bookings.
- **Price Revisions**: Technicians must specify extra amounts and scope on-site; the booking cannot be marked completed or billed without customer authorization.
- **Completion Assurance**: Technicians submit completion notes; customer verifies and confirms satisfaction before provider settlement status is unlocked.

---

## 6. Financial Architecture & Minor Units

All monetary values are calculated and persisted as **integers in minor units** (paise/cents: e.g. ₹1,499.00 = `149900`) to guarantee zero floating point arithmetic drift:
- $\text{Total Paid} = \text{Agreed Amount} + \text{Approved Price Revisions} - \text{Discounts}$
- $\text{Platform Commission} = \text{Order Value} \times \text{Category Commission Rate \%}$
- $\text{Provider Net Payout} = \text{Order Value} - \text{Platform Commission}$
- Clear separation between Platform Net Revenue and Provider Escrow/Settlements.

---

## 7. Provider Rewards & Social Recognition Safeguards

- **5-Pillar Score Formula**:
  - Verified Completed Bookings: **30%**
  - Customer Ratings & Verified Reviews: **25%**
  - Punctuality & Reliability: **20%**
  - Complaint & Dispute signals: **15%**
  - Professional Conduct: **10%**
- **Explicit Recorded Consent**: Administrators cannot publish a technician's name, photograph, or craftsmanship story to social media recognition spotlights without explicit recorded consent (`ConsentStatus.GRANTED`).
- Providers can withdraw consent at any time from their Rewards dashboard.
