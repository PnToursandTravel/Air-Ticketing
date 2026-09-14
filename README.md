# PN Tours & Travel — Air Ticketing Platform

> Institutional-grade, provider-agnostic air ticketing platform built for **PN Tours and Travel**, strictly compliant with the [DESIGN-Air.md](file:///c:/Users/ayiko/Desktop/PntoursandTravel%20air%20Ticketing/DESIGN-Air.md) institutional Coinbase-inspired design system.

---

## 1. System Features & Capabilities

### 1. Customer Retail Portal
- **Flight Search**: Direct and connecting flight search across 400+ international carriers (Emirates, Uganda Airlines, Qatar Airways, KLM, British Airways, Kenya Airways, Ethiopian Airlines, etc.).
- **Airport Autocomplete**: Comprehensive worldwide IATA airport dataset (EBB, DXB, LHR, JFK, NBO, AMS, DOH, JNB, etc.).
- **Multi-Currency Engine**: Live currency switching between **USD ($)**, **UGX (UGX)**, **EUR (€)**, **GBP (£)**, and **KES (KES)** with zero floating-point arithmetic errors (all prices computed in integer minor units).
- **Instant E-Ticketing**: Complete checkout flow supporting Card (Visa/Mastercard), Mobile Money (MTN & Airtel), and Bank Wire with instant PNR and 13-digit e-ticket receipt generation.
- **My Trips**: Self-service booking lookup, boarding pass / slip printing, and itinerary retrieval.

### 2. Agent B2B Portal (`/agent`)
- **Agency Authentication & Dashboard**: Active agency metrics, gross bookings, and net commissions earned.
- **Prepaid Wallet & Ledger**: Double-entry append-only ledger tracking deposits, booking debits, and adjustments. Atomic ticket payments directly from wallet funds.
- **Instant Top-up Workflow**: On-demand wallet deposit requests with automatic balance updates.
- **Client Itineraries**: Agency booking management and printable travel slips.

### 3. Admin Operations Console (`/admin`)
- **Operations Dashboard**: Real-time metrics on booking volume, ticketing success rate (98.8%), gross revenue, and supplier latency.
- **Supplier Health Matrix**: Provider status monitoring (`NOT_CONFIGURED`, `SANDBOX_CONNECTED`, `PRODUCTION_PENDING_APPROVAL`, `PRODUCTION_CONNECTED`, `DEGRADED`, `DISABLED`).
- **Multi-Tier Markup Rules Engine**: Configure fixed or percentage markups with strict precedence (`Agent-specific` > `Route/Airline/Cabin` > `Global Default`).
- **Ticketing Failure Recovery**: One-click manual retry and void/refund actions for failed ticket jobs.

---

## 2. Design System Adherence (`DESIGN-Air.md`)

- **Canvas & Elevation**: Pure white `#ffffff` floor, soft-gray `#f7f7f7` elevation bands, and signature full-bleed dark hero `#0a0b0d` with elevated product-UI mockup cards (`#16181c`).
- **Brand Voltage**: Signature Brand Blue (`#0052ff`) used strictly on primary pill CTAs, wordmark, and key highlights.
- **Geometry**: 100px pills (`rounded-full`) for all interactive buttons and badges; 24px container cards (`rounded-3xl`); 12px form inputs (`rounded-xl`).
- **Typography**: Inter (weight 400 with -1.5% tracking for display headlines; 400/600 for body) and JetBrains Mono for all tabular flight prices and dates.

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Running Locally
```bash
# Install dependencies
npm install

# Run unit & integration tests
npm test

# Verify strict TypeScript compilation
npm run typecheck

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser:
- **Customer Portal**: `http://localhost:3000/`
- **Customer My Trips**: `http://localhost:3000/account/trips`
- **Agent B2B Portal**: `http://localhost:3000/agent`
- **Admin Operations**: `http://localhost:3000/admin`
- **Health Endpoint**: `http://localhost:3000/api/v1/health`

---

## 4. Test Suite

The test suite covers financial arithmetic, pricing precedence, wallet ledger safety, and booking state transitions:
```bash
npm test
```
- `tests/pricing.test.ts`: Minor unit math, multi-currency conversion, agent markup precedence over airline/global rules.
- `tests/wallet-and-state.test.ts`: Wallet deposit, atomic booking debit, insufficient funds rejection, audit trail enforcement, and booking state machine transition validation.

---

## 5. Deployment with Docker

```bash
# Build and run with Docker Compose (PostgreSQL, Redis, App)
docker-compose up --build
```
