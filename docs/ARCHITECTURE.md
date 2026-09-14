# Architecture — PN Tours and Travel Air Ticketing Platform

## 1. System Overview

PN Tours and Travel Air Ticketing is an institutional-grade, multi-tenant air travel management and ticketing platform designed to support three distinct user interfaces:
1. **Customer Portal**: Direct retail travelers searching, comparing, booking, and managing flight reservations.
2. **Agent B2B Portal (`/agent`)**: Accredited travel agencies and sub-agents booking on behalf of clients, applying permitted markups, managing customer address books, and transacting through an atomic prepaid wallet ledger.
3. **Admin Operations Portal (`/admin`)**: Operations, finance, support, and administrative personnel overseeing booking lifecycles, supplier connections, automated & manual ticketing, multi-tier pricing rules, and compliance audits.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 Next.js App Router UI                  │
                  │   ┌──────────────────┬─────────────────┬───────────┐   │
                  │   │ Customer Portal  │  Agent Portal   │   Admin   │   │
                  │   │  (Search/Book)   │  (B2B/Wallet)   │ (Ops/Set) │   │
                  │   └──────────────────┴─────────────────┴───────────┘   │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                     Secure Cookies / RBAC
                                              │
                  ┌───────────────────────────▼────────────────────────────┐
                  │                    REST API Layer                      │
                  │             /api/v1 (Zod-validated boundaries)         │
                  └──────┬────────────────────┬────────────────────┬───────┘
                         │                    │                    │
         ┌───────────────▼───────┐  ┌─────────▼──────────┐  ┌──────▼────────┐
         │ Flight Provider Engine│  │   Booking Engine   │  │ Wallet/Ledger │
         │   (Mock + Live Slot)  │  │   (State Machine)  │  │ (Double Entry)│
         └───────────────┬───────┘  └─────────┬──────────┘  └──────┬────────┘
                         │                    │                    │
         ┌───────────────▼────────────────────▼────────────────────▼───────┐
         │                        Database & Storage                       │
         │                  PostgreSQL / Prisma ORM Engine                 │
         └─────────────────────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Control (RBAC) Matrix

Every API endpoint, server action, and UI route enforces authorization server-side. UI visibility is never treated as authorization.

| Resource / Action | CUSTOMER | AGENT_STAFF | AGENT_OWNER | SUPPORT | FINANCE | OPERATIONS | ADMIN | SUPER_ADMIN |
|---|---|---|---|---|---|---|---|---|
| **Public Flight Search** | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed | Allowed |
| **Book Flight (Retail)** | Own | Denied | Denied | Denied | Denied | Denied | Denied | Allowed |
| **Book Flight (Agency)** | Denied | Own Agency | Own Agency | Denied | Denied | Denied | Denied | Allowed |
| **View Bookings** | Own | Own Agency | Own Agency | All Read | All Read | All Read | All Read | All Read/Write |
| **Apply Agent Markup** | Denied | View Only | Permitted | Denied | Denied | Denied | Denied | Overwrite |
| **Wallet Top-up Request** | Denied | Denied | Permitted | Denied | Denied | Denied | Denied | Allowed |
| **Wallet Top-up Approval**| Denied | Denied | Denied | Denied | Permitted | Denied | Permitted | Permitted |
| **Manual Wallet Adjust** | Denied | Denied | Denied | Denied | Permitted | Denied | Permitted | Permitted |
| **Trigger Ticket Issuance**| Denied | Auto/Allowed| Auto/Allowed| Denied | Denied | Permitted | Permitted | Permitted |
| **Pricing Rules Engine** | Denied | Denied | Denied | Denied | View | View | Full | Full |
| **Supplier Health & Config**| Denied | Denied | Denied | Denied | Denied | View | Full | Full |
| **Audit Logs Inspection**| Denied | Denied | Denied | Denied | View | View | Full | Full |

---

## 3. Flight Provider Abstraction Architecture

The flight platform does not couple to any single supplier's proprietary payload. It utilizes an internal normalized domain model via `IFlightProvider`:

- `searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse>`
- `getOffer(offerId: string): Promise<FlightOffer>`
- `revalidateOffer(offerId: string, context: RevalidationContext): Promise<RevalidationResult>`
- `createOrder(orderRequest: OrderCreateRequest): Promise<ProviderBookingResult>`
- `issueTicket(providerBookingId: string): Promise<TicketingResult>`
- `cancelBooking(providerBookingId: string, request: CancelRequest): Promise<CancelResult>`
- `getRefundQuote(providerBookingId: string): Promise<RefundQuote>`
- `healthCheck(): Promise<SupplierHealthStatus>`

### Provider Implementations:
1. **`MockFlightProvider`**: High-fidelity engine generating realistic itineraries across global airlines (Emirates, Qatar Airways, KLM, British Airways, Uganda Airlines, Kenya Airways, Ethiopian Airlines) with real-world IATA airport codes, layovers, realistic cabin classes, baggage allowance, dynamic price fluctuations, and revalidation logic.
2. **`LiveSupplierAdapter`**: Ready-to-connect integration wrapper awaiting contractual IATA/GDS/NDC credentials.

---

## 4. Financial & Pricing Architecture

- **Zero Floating-Point Arithmetic**: All monetary values are calculated and stored in integer minor units (e.g. `$540.50` = `54050` cents, `UGX 1,500,000` = `150000000`).
- **Rule Precedence Hierarchy**:
  1. `Agent Specific Markup` (highest priority)
  2. `Route / Airline / Cabin Rule`
  3. `Global Baseline Markup` (lowest priority)
- **Immutable Price Snapshots**: Every confirmed booking preserves a frozen JSON snapshot of all price components (supplier base, supplier tax, supplier fees, admin markup, agent markup, service fees, applied FX rate), ensuring historical reporting remains invariant under future rule changes.
