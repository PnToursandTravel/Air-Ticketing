# Architectural Decision Records (ADRs) — PN Tours and Travel

## ADR 001: Next.js App Router Monorepo Architecture
- **Status**: Accepted
- **Context**: The platform requires three distinct portals (Customer, Agent, Admin) plus REST API endpoints and back-office services.
- **Decision**: Adopt Next.js App Router with modular server-side domain services located in `lib/` and clean modular packages for types and provider contracts. Server actions and versioned REST endpoints (`/api/v1/`) encapsulate business logic with strict Zod validation.
- **Consequences**: Single cohesive TypeScript codebase, streamlined deployment, shared type safety across UI and API.

## ADR 002: Flight Supplier Provider-Agnostic Abstraction
- **Status**: Accepted
- **Context**: The project owner notes IATA affiliation, but IATA does not provide a direct turn-key retail search/ticketing API without specific GDS/NDC aggregator credentials.
- **Decision**: Build an `IFlightProvider` abstraction and implement a high-fidelity `MockFlightProvider` for all standard operations (search, revalidate, hold, issue, cancel, refund). Leave a structured, isolated `LiveSupplierAdapter` slot ready to receive actual aggregator/NDC credentials without touching client UI or core state machines.
- **Consequences**: Immediate end-to-end testing, zero blocker on credentials, clean cutover when live API keys are provided.

## ADR 003: Double-Entry Append-Only Wallet Ledger
- **Status**: Accepted
- **Context**: Travel agents use prepaid wallet balances for real-time flight ticketing. Overwriting balances directly leads to race conditions and audit loss.
- **Decision**: All wallet balance mutations must be recorded as append-only ledger entries (`DEPOSIT`, `BOOKING_DEBIT`, `REFUND_CREDIT`, `MANUAL_ADJUSTMENT`). Current balance is calculated transactionally, and manual adjustments require an actor identity and audit reason.
- **Consequences**: Total financial auditability, zero balance drift.

## ADR 004: Money Representation in Minor Units
- **Status**: Accepted
- **Context**: JavaScript floating-point math causes rounding inaccuracies (e.g. `0.1 + 0.2 !== 0.3`).
- **Decision**: All prices, taxes, markups, and ledger amounts are represented as integers in minor currency units (cents/subunits). Formatting helpers handle display rendering.
- **Consequences**: Exact arithmetic, zero roundoff discrepancies on invoices or payment captures.

## ADR 005: Institutional Design System (Coinbase-inspired DESIGN-Air.md)
- **Status**: Accepted
- **Context**: Travel booking interfaces often feel cluttered with aggressive countdowns and distracting banners.
- **Decision**: Strictly adopt the specifications of `DESIGN-Air.md`: pure white canvas (`#ffffff`), dark hero bands (`#0a0b0d`), 100px pill CTAs, 24px cards, Inter font display (weight 400 with -1.5% letter spacing), and restrained `#0052ff` Brand Blue accents.
- **Consequences**: Modern, trustworthy, institutional aesthetic suitable for international business and leisure travelers.
