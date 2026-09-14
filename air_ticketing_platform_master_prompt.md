# Master Build Prompt — Production-Ready Air Ticketing Platform

> **How to use:** Paste this entire prompt into your AI coding assistant. Replace every value in the **Project Inputs** section before beginning. Ask the AI to work phase by phase, keep a living `docs/BUILD_LOG.md`, and stop only when it needs a credential, commercial decision, or external approval that cannot safely be assumed.

---

## Project Inputs — complete before implementation

```yaml
company_name: "[pntoursandtravel air ticketing]"
primary_market: "[World wide]"
primary_currency: "[Auto switch based on geo location]"
secondary_currencies: ["[Auto switch based on the geo location]"]
app_url: "[https://example.com]"

Design : "#[use the DESIGN-Air.md file for a the design and layout and every detail included]"
brand_logo_url: "[https://www.image2url.com/r2/default/images/1789406854595-5200c580-b543-4d37-b30f-73c90d73d473.png]"
support_email: "[SUPPORT_EMAIL]"
support_phone: "[
+256 785360444]"
from_email: "[]"
flight_supplier_name: "[i want the project to conitinuw for the time being and leave a provision for a api to be place when its got because we are using IATA]"

payment_provider: "[conitinue if not privided and will be given later]"
payment_provider_docs_url: "[conitinue it will be given at the end ]"
email_provider: "[Resend / Postmark / SES]"
notification_channels: ["email"]
agent_wallet_enabled: true
agent_credit_enabled: false
multi_currency_enabled: false
languages: ["en"]

---

## The master prompt

```text
You are a principal full-stack engineer, travel-technology architect, security engineer, QA lead, DevOps engineer, and product designer. Build a complete, secure, production-ready air ticketing web platform named [PROJECT_NAME] for [COMPANY_NAME].

The system must support three independently secured user experiences:

1. Customer portal — direct travellers search, book, pay for, and manage flights.
2. Agent portal — approved travel agents sell flights to their own customers, apply permitted markups, use wallet/credit where enabled, and monitor bookings/commissions.
3. Admin portal — internal staff control users, agents, supplier integrations, pricing, bookings, ticketing, payments, refunds, reports, and operational settings.

The platform will receive flight content and ticketing capability from a third-party supplier API. IATA is the industry association that provides industry services and accreditation-related programs; it is not automatically a universal retail flight-search-and-ticketing API. Do not invent, scrape, or assume IATA API credentials or endpoints. Build a provider-agnostic integration layer and use only the actual supplier API documentation and credentials supplied by the project owner. If the owner has an IATA-related product, accreditation, Timatic service, or other approved access, integrate only the documented product after the owner provides a contract, credentials, sandbox URL, scopes, and API documentation.

Never expose supplier, payment, email, storage, or database secrets to the browser, repository, logs, error messages, screenshots, or test fixtures. Never use real passenger data, real payment cards, or production supplier credentials in local/test environments.

## 1. Working rules

- Begin by reading this full specification.
- Create `docs/BUILD_LOG.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/API_CONTRACT.md`, `docs/SECURITY.md`, `docs/OPERATIONS.md`, and `docs/GO_LIVE_CHECKLIST.md`.
- Maintain `docs/BUILD_LOG.md` after every completed milestone with completed work, files changed, tests run, assumptions, known limitations, and next actions.
- Do not claim a feature is complete until it is implemented, tested, linted, type-checked, and documented.
- Use small, reviewable commits if a Git repository is available. Use conventional commit messages.
- Do not block on missing API credentials. Implement the integration interface, a sandbox/mock provider, UI states, environment-variable validation, and tests. Clearly mark the real-provider connection as pending until credentials and documentation are available.
- Ask targeted questions only for information that cannot be safely inferred. Otherwise choose sensible defaults and record them in `docs/DECISIONS.md`.
- Prefer simple, maintainable, accessible implementation over unnecessary microservices or premature complexity.

## 2. Required technology stack

Build a TypeScript monorepo using the following default stack unless the existing repository dictates an equivalent established stack:

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, accessible component primitives.
- Backend API: NestJS or a separately deployable TypeScript API service. Use REST with OpenAPI documentation. If a monorepo uses Next.js route handlers, keep all supplier/payment logic server-side and modular; do not create business logic directly in page components.
- Database: PostgreSQL.
- ORM and migrations: Prisma preferred.
- Background jobs and queues: Redis + BullMQ.
- Authentication: secure session-based authentication or short-lived access tokens with rotating refresh tokens; HTTP-only secure cookies for browser sessions.
- Validation: Zod at client boundaries and server boundaries.
- Email: provider abstraction supporting [EMAIL_PROVIDER].
- Files: S3-compatible object storage abstraction for invoices, ticket PDFs, and approved documents.
- Monitoring: structured JSON logs, error tracking integration, health endpoints, and tracing-ready request IDs.
- Testing: Vitest/Jest for unit/integration tests; Playwright for end-to-end tests; API contract tests for the supplier adapter.
- Deployment: Dockerfiles, docker-compose for local development, CI/CD pipeline, environment validation, database migration procedure, and a production deployment guide.

Use current stable compatible versions. Pin dependency versions appropriately. Configure ESLint, Prettier, TypeScript strict mode, and pre-commit checks where practical.

## 3. Repository structure

Create a clean monorepo structure such as:

/apps
  /web                 # Customer, agent, and admin interfaces
  /api                 # Backend API when separated from web
  /worker              # Background jobs: ticketing, notifications, retries
/packages
  /ui                  # Shared UI components and design tokens
  /types               # Shared domain types
  /config              # Shared TypeScript/ESLint configuration
  /flight-provider     # Provider contracts, mapper, mock adapter
  /notifications       # Email/SMS abstraction and templates
/docs
/infra
  /docker
  /ci

Use domain modules rather than a single large service:

- auth
- users
- roles-permissions
- agents
- customers
- passengers
- flights
- offers
- pricing
- bookings
- ticketing
- payments
- wallets
- refunds
- suppliers
- notifications
- reports
- files
- audit
- webhooks
- support
- settings

## 4. Product requirements

### 4.1 Customer portal

Implement a responsive public flight-booking experience.

Required pages and capabilities:

- Landing/home page with flight search widget.
- Flight search form: one-way and round-trip journeys, origin, destination, departure date, return date when applicable, cabin class, adults, children, and infants.
- Airport autocomplete using the supplier-provided airport data or an approved local airport reference dataset. Do not hardcode fictional airports.
- Search results with filters and sorting where the supplier data supports it.
- Each result must clearly show airline, departure/arrival local times, duration, stop count, layover details, baggage allowance if supplied, fare brand/family if supplied, currency, total price, and fare conditions.
- Flight details page/modal with itinerary, fare rules, baggage, change/cancellation conditions, and full price breakdown.
- Revalidation flow before traveller details and again before final payment/issuance when required by supplier rules.
- Traveller form with adult, child, and infant validation; names must match travel-document requirements. Collect only supplier-required fields. Support passport/document fields only when required for the itinerary/supplier.
- Contact details form, consent checkbox, terms/privacy acceptance, and clear disclosures.
- Checkout and payment workflow.
- Booking confirmation page with internal booking reference, PNR when available, ticket status, ticket number when issued, payment status, itinerary, and invoice/itinerary downloads.
- “My Trips” page for authenticated customers: booking search, booking detail, cancellation request, documents, and support request.
- Guest checkout may be enabled only if secure booking retrieval uses a verified email/phone plus booking reference. Otherwise require account creation.
- Responsive design for mobile, tablet, and desktop.
- Accessible forms, keyboard navigation, valid labels, meaningful errors, contrast compliance, and loading states.

### 4.2 Agent portal

Implement a B2B portal at `/agent` with stricter permissions.

Required features:

- Agent sign-in and account status: pending, active, suspended, rejected.
- Agent dashboard with bookings, gross sales, commission, wallet balance, credit balance/limit if enabled, and failed/pending bookings.
- Book flights for existing or new customers.
- Customer profile/address book and saved passengers, subject to privacy controls.
- Agent-specific markups and commissions displayed according to business rules.
- Wallet balance, wallet ledger, top-up request workflow, and optional finance/admin approval.
- Optional agent credit limit, utilization, and credit transaction audit trail.
- Agent booking list and detail pages with search/filter by date, PNR, booking reference, ticket number, passenger, status, and destination.
- Download itinerary and invoice where permitted.
- Cancellation/refund request submission.
- Sales and commission reports with date range filtering and CSV export.
- Agent profile, staff users, and permission management if sub-users are enabled.

### 4.3 Admin portal

Implement `/admin` with least-privilege role-based access controls.

Required modules:

- Operational dashboard: booking counts, ticketing success/failure, payment status, sales, refunds, agent balances, alerts, and supplier health.
- User management: customers, agents, agent staff, admins, support, finance roles.
- Agent approval, suspension, commission plans, wallet changes, credit limits, and agent notes.
- Booking management: view lifecycle, segments, passengers (masked where necessary), provider logs, payment data, cancellation/refund status, ticketing retry actions with safeguards.
- Markup/rules engine management: global, airline, route, cabin, supplier, sales channel, and agent-specific rules. Rules must support fixed amounts and percentages with precedence and effective dates.
- Payment management: transactions, payment events, reconciliation statuses, refunds, chargeback/dispute notes if applicable.
- Wallet management: deposits, approvals, adjustments, debits, credits, ledger, and mandatory audit reason for manual adjustments.
- Supplier configuration: provider enabled state, sandbox/production environment, encrypted credentials reference, supported features, timeout/retry policy, and health status. Do not expose secret values after saving.
- Notification template/configuration management.
- Refund/cancellation operations with approval permissions and immutable audit history.
- Reports: bookings, revenue, markup/profit, agent sales/commission, supplier errors, cancellations, refunds, outstanding credit, and export capability.
- Audit log search: actor, action, target, date, IP/request ID where available.
- Application settings: company profile, legal pages, supported currencies, time zone, and operational controls.

## 5. Roles and permissions

Implement RBAC with database-backed roles and permissions. At minimum:

- CUSTOMER
- AGENT_OWNER
- AGENT_STAFF
- ADMIN
- FINANCE
- SUPPORT
- OPERATIONS
- SUPER_ADMIN

Enforce authorization server-side for every endpoint and mutation. UI visibility alone is never authorization.

Create a permission matrix and document it in `docs/ARCHITECTURE.md`. Examples:

- Customers may access only their own bookings and passengers.
- Agents may access only records belonging to their agency and permitted customers.
- Support may view booking data but cannot alter pricing, wallets, or supplier credentials.
- Finance may approve wallet adjustments/refunds according to policy but cannot change supplier setup.
- Only designated high-privilege administrators can change provider environment or pricing-rule configurations.

## 6. Flight supplier and IATA-related integration rules

Build a provider-agnostic adapter interface. The flight platform must not depend directly on any single supplier’s payload shape.

Create interfaces such as:

- `searchFlights(request): SearchResponse`
- `getOffer(offerId): Offer`
- `revalidateOffer(offerId, context): RevalidatedOffer`
- `createOrder(orderRequest): ProviderBooking`
- `issueTicket(providerBookingId): TicketingResult`
- `getBooking(providerBookingId): ProviderBooking`
- `cancelBooking(providerBookingId, request): CancellationResult`
- `getRefundQuote(providerBookingId): RefundQuote`
- `createRefund(providerBookingId, request): RefundResult`
- `getAncillaries(offerId)` only where the provider supports it
- `healthCheck()`

Create:

1. `MockFlightProvider` for local development and E2E tests. It must simulate realistic outcomes: success, price change, sold out, provider timeout, booking pending, ticketing pending, ticket issuance success, ticketing failure, cancellation allowed/not allowed, and refund pending.
2. `SupplierXAdapter` placeholder implementation behind feature flags, created only from the actual provided documentation.
3. A mapping layer from supplier payloads to an internal normalized schema.
4. A secure provider-client module with timeouts, retries only for safe/idempotent operations, circuit-breaker strategy, request IDs, redacted logs, and error mapping.
5. Webhook verification and idempotent event handling when the provider supports webhooks.

Important constraints:

- Do not fabricate a connection to `https://www.iata.org/`.
- Do not represent IATA accreditation, IATA numbers, BSP access, ticketing authority, NDC access, or Timatic access as granted until the client supplies documented evidence and valid credentials.
- Store API secrets as environment-managed secrets, not plain text in the database. If an admin configures a secret, encrypt it with an application-managed key and show it only once, or preferably store a secret reference managed by the deployment platform.
- Build an integration settings screen that supports status labels: NOT_CONFIGURED, SANDBOX_CONNECTED, PRODUCTION_PENDING_APPROVAL, PRODUCTION_CONNECTED, DEGRADED, DISABLED.
- Add a provider capability matrix so features not supported by the supplier are disabled gracefully rather than failing during checkout.

Use these environment variables as placeholders only:

```env
FLIGHT_PROVIDER=mock
FLIGHT_PROVIDER_ENV=sandbox
FLIGHT_PROVIDER_BASE_URL=
FLIGHT_PROVIDER_CLIENT_ID=
FLIGHT_PROVIDER_CLIENT_SECRET=
FLIGHT_PROVIDER_API_KEY=
FLIGHT_PROVIDER_WEBHOOK_SECRET=
```

Add an `.env.example` that includes all required variable names but no real values.

## 7. Booking and ticketing state machine

Implement explicit, validated state machines. Do not rely on arbitrary strings in page components.

Booking states:

- DRAFT
- SEARCHED
- OFFER_SELECTED
- REVALIDATION_REQUIRED
- PRICE_CHANGED
- SOLD_OUT
- TRAVELLER_DETAILS_PENDING
- PENDING_PAYMENT
- PAYMENT_FAILED
- PAYMENT_CONFIRMED
- BOOKING_PENDING
- BOOKED
- TICKETING_PENDING
- TICKETED
- TICKETING_FAILED
- CANCEL_REQUESTED
- CANCELLATION_PENDING
- CANCELLED
- REFUND_QUOTE_PENDING
- REFUND_REQUESTED
- REFUND_PENDING
- REFUNDED
- FAILED
- EXPIRED

Payment states:

- INITIATED
- PENDING
- AUTHORIZED
- SUCCEEDED
- FAILED
- CANCELLED
- REFUNDED
- PARTIALLY_REFUNDED
- CHARGEBACK

Ticket states:

- NOT_REQUESTED
- PENDING
- ISSUED
- FAILED
- VOIDED
- REFUNDED

Rules:

- Search offers expire. Store expiry time and prevent booking expired offers.
- Revalidate fare/availability before charging where supplier requirements demand it.
- Never treat a payment success as a ticketing success.
- Never tell a traveller a ticket was issued until the provider returns confirmed issued status and ticket number(s) where applicable.
- Every external operation must use idempotency keys and immutable event records.
- Ticketing should run as a background job after payment confirmation unless the provider workflow requires a synchronous call. The UI must display a truthful pending status when necessary.
- Failed ticketing after successful payment must raise an operations alert and enter a recoverable workflow, not silently fail.
- Use compensating/refund procedures according to the provider and payment rules. Do not automatically refund unless configured policies and provider confirmation allow it.

## 8. Pricing and money rules

Implement all monetary calculations in integer minor units or a decimal money library. Never use JavaScript floating-point arithmetic for prices.

Price components must be stored separately:

- supplier base fare
- supplier taxes
- supplier fees
- admin markup
- agent markup
- service fee
- discount
- payment fee if legally/contractually permitted
- total payable
- currency
- FX rate and source/timestamp if multi-currency is enabled

Pricing rules must:

- Support fixed and percentage markups.
- Support precedence: agent-specific > route/airline/cabin/supplier-specific > global default.
- Support eligibility conditions and start/end effective dates.
- Produce an explainable pricing breakdown for authorized staff.
- Create a price snapshot attached to every booking so historical invoices and reports remain correct after future rule changes.
- Prevent negative totals unless explicitly authorized by a controlled discount policy.

## 9. Payments and wallet design

Implement a payment-provider abstraction. Integrate [PAYMENT_PROVIDER] only from its actual API documentation and sandbox keys supplied by the client.

Requirements:

- Server creates payment intent/order; client receives only a public token or redirect URL when applicable.
- Verify all payment-webhook signatures server-side.
- Make webhook processing idempotent and persist raw event metadata with sensitive details redacted.
- Do not trust browser-reported payment success.
- Reconcile payments to bookings using unique internal references.
- Implement wallet ledger as append-only accounting entries. Never directly overwrite balance without generating a ledger transaction.
- Balance calculations must be transactionally safe.
- Manual wallet adjustments require finance/admin permission, reason, actor identity, and audit event.
- Agent wallet debit must be atomic with booking workflow safeguards.

## 10. Database design

Use PostgreSQL and Prisma migrations. Design normalized tables and indexes for common searches. At minimum create models/tables for:

- users
- user_sessions / refresh_tokens as appropriate
- roles
- permissions
- user_roles
- agencies
- agents
- agent_staff
- customers
- passenger_profiles
- bookings
- booking_passengers
- booking_segments
- booking_price_snapshots
- tickets
- flight_search_sessions
- flight_offers or securely cached offer references
- supplier_connections
- supplier_api_logs
- supplier_webhook_events
- payments
- payment_events
- wallets
- wallet_ledger_entries
- markup_rules
- cancellation_requests
- refund_requests
- refunds
- documents
- notifications
- support_tickets
- audit_logs
- idempotency_keys
- outbox_events / background_job records if appropriate

Add foreign keys, suitable indexes, timestamps, created/updated actor references, soft-delete only where justified, and immutable financial/audit records. Avoid storing full raw supplier payloads indefinitely if they include unnecessary sensitive information; redact and retain according to the documented data-retention policy.

## 11. API design

Create versioned REST endpoints under `/api/v1`. Generate and serve OpenAPI documentation in non-production or behind admin authorization.

Provide APIs for:

- Auth: registration, login, logout, password reset, email verification, session refresh.
- Flight search, offer details, revalidation.
- Customer booking draft creation, traveller updates, payment initiation, booking detail, document access, cancellation/refund request.
- Agent customer management, agent booking operations, wallet/report access.
- Admin agent management, booking actions, pricing rules, reports, supplier status, settings, refunds, wallet approvals.
- Payment and supplier webhooks.
- Health/readiness endpoints.

For all write endpoints:

- Require authentication/authorization where applicable.
- Validate request bodies with schemas.
- Use idempotency keys for operations that could create a payment, booking, ticket, refund, or wallet transaction.
- Return stable error codes and user-safe messages.
- Include request IDs in responses/logs.
- Avoid leaking supplier errors, secrets, system paths, or personal data.

Document example requests and responses in `docs/API_CONTRACT.md`.

## 12. Frontend and design requirements

Create a professional, trustworthy travel brand interface.

- Use [BRAND_PRIMARY_COLOR] as the primary color and create coherent design tokens.
- Make key trust states visible: secure checkout, payment pending, booking confirmed, ticketing pending, ticket issued, action required, and refund status.
- Avoid deceptive urgency, hidden fees, or unclear airline/fare conditions.
- Make the full price and currency clear before payment.
- Display timezone-aware flight times and dates.
- Clearly distinguish a reservation/PNR from an issued e-ticket.
- Provide user-friendly loading, empty, error, retry, and offline/degraded-provider states.
- Use skeleton loading for search results where suitable.
- Follow WCAG 2.2 AA principles as far as practical: semantic HTML, keyboard operation, focus states, labels, error association, contrast, and screen-reader-friendly status updates.

Routes should be clear, for example:

- `/`
- `/flights/search`
- `/flights/offer/[id]`
- `/checkout/[bookingId]`
- `/booking/[reference]`
- `/account/trips`
- `/agent`
- `/agent/bookings`
- `/agent/wallet`
- `/admin`
- `/admin/bookings`
- `/admin/agents`
- `/admin/pricing`
- `/admin/suppliers`
- `/admin/reports`

## 13. Security requirements

Treat this as a financially sensitive travel system.

Implement and document:

- Strict TypeScript and server-side validation.
- RBAC plus object-level authorization checks.
- Password hashing using Argon2id or a current secure equivalent.
- Secure, HTTP-only, SameSite cookies; `Secure` in production.
- CSRF protection for cookie-authenticated mutations.
- Content Security Policy, secure headers, CORS allowlist, rate limiting, request-size limits, and bot/abuse safeguards.
- Rate limits for login, password reset, flight search, booking creation, and webhook endpoints.
- Input sanitization and safe output rendering to prevent XSS.
- Parameterized database access through ORM/query builder to prevent SQL injection.
- Encryption in transit (TLS) and encrypted secrets at rest.
- PII minimization, masking, access logging, retention policy, export/deletion workflow where law and operational obligations permit.
- Separate production, staging, sandbox, and local credentials.
- No payment card data stored by this platform. Use tokenization/hosted checkout from the payment provider.
- Dependency scanning, secret scanning, and vulnerability remediation process.
- Backups, restore instructions, and disaster-recovery runbook.
- Audit events for security-sensitive actions.

## 14. Background jobs and reliability

Use background processing for:

- ticket issuance
- supplier retries where safe
- payment reconciliation
- webhook follow-up
- email/SMS notifications
- invoice and itinerary PDF generation
- report exports
- scheduled expiry cleanup
- health checks and alerts

Requirements:

- Every job must be idempotent.
- Use retries with exponential backoff only for transient, safe failures.
- Send unrecoverable jobs to a dead-letter queue and create an admin-visible alert.
- Provide job observability and a secure admin retry mechanism.
- Use transactional outbox or equivalent patterns when events must be reliably produced following database changes.

## 15. Documents and notifications

Generate branded PDF itinerary and invoice documents only after confirmed booking/ticketing states appropriate to the document type.

Include:

- Internal booking reference
- PNR where available
- Ticket numbers only when issued
- Passenger and segment details
- Price breakdown and currency
- Company support contact
- Clear status label and disclaimer for pending ticketing

Send notifications for:

- account verification
- booking created
- payment received
- payment failed
- ticket issued
- ticketing pending/failed when customer action or support follow-up is needed
- cancellation/refund status changes
- wallet top-up request/approval
- agent account approval/suspension

Do not include secrets or unnecessary sensitive document data in email. Make notification sending asynchronous and track delivery status.

## 16. Testing requirements

Build a serious test suite.

Unit tests must cover:

- pricing-rule precedence and monetary calculations
- booking state transitions
- permission checks
- wallet ledger calculations
- idempotency behavior
- supplier payload mapping
- provider error mapping
- payment webhook verification logic

Integration tests must cover:

- authentication and RBAC
- flight search via mock provider
- price change and sold-out revalidation paths
- booking creation and transaction integrity
- payment webhook to ticketing job flow
- successful ticket issuance
- payment success plus ticketing failure recovery path
- agent wallet debit and ledger correctness
- cancellation/refund request workflows
- admin pricing-rule updates and audit log creation

End-to-end Playwright tests must cover:

- customer search-to-booking flow using mocked external providers
- customer login and My Trips access control
- agent booking workflow
- admin approval/markup workflow
- responsive mobile booking flow
- critical accessibility checks

Run lint, typecheck, unit tests, integration tests, E2E tests, and production build in CI. Do not use live supplier or payment credentials in CI.

## 17. DevOps and deployment

Deliver a production deployment setup.

Create:

- Dockerfile(s) using multi-stage builds.
- `docker-compose.yml` for local development with PostgreSQL, Redis, web/API, and worker.
- `.env.example` with descriptions in documentation, never secrets.
- CI pipeline for install, lint, typecheck, test, build, dependency/security checks, and migration validation.
- Database migration deployment workflow that runs safely before or during release.
- Staging and production environment documentation.
- Health endpoints: liveness and readiness checks. Readiness must verify database/Redis and report supplier status without exposing credentials.
- Centralized structured logs and error monitoring hooks.
- Backup and restoration guide.
- Rollback procedure.
- DNS, TLS, email-domain verification, and environment-secrets checklist.

Suggested deployment separation:

- Web/API service
- Background worker service
- Managed PostgreSQL
- Managed Redis
- Object storage
- Monitoring/error tracking

## 18. Implementation plan and acceptance criteria

Implement in these phases. At the end of every phase, run the relevant tests, update documentation, and provide a concise completion report.

### Phase 0 — Discovery and foundation

- Inspect existing repository.
- Finalize architecture and assumptions.
- Scaffold monorepo, formatting, linting, strict TypeScript, environment validation, Docker local stack, database, Redis, and CI foundations.
- Create design tokens and application shell.

Acceptance criteria:
- Project starts locally from documented commands.
- Lint, typecheck, and a baseline test pass.
- Environment validation rejects missing required environment variables for enabled features.

### Phase 1 — Identity, RBAC, and data model

- Implement authentication, session handling, email verification placeholders, password reset, RBAC, object-level authorization, audit log, Prisma schema, migrations, and seed data for safe local development.

Acceptance criteria:
- Each role can access only permitted routes and API resources.
- Attempted privilege escalation is covered by tests.
- Audit logs record sensitive administrative actions.

### Phase 2 — Flight search and supplier abstraction

- Implement normalized domain models, MockFlightProvider, search form, airport/autocomplete strategy, results UI, offer details, supplier status controls, and revalidation flows.

Acceptance criteria:
- Search works end-to-end with mock data.
- Price-change, expired-offer, sold-out, and timeout states render correctly.
- No supplier secret is present in browser code or network responses.

### Phase 3 — Booking, pricing, and traveller workflow

- Implement booking draft, passenger handling, price snapshots, markup engine, customer/agent booking rules, booking state machine, and document-ready data model.

Acceptance criteria:
- Pricing tests cover all rule precedence paths.
- Booking state transitions reject invalid moves.
- An agent cannot view or book using another agency’s data.

### Phase 4 — Payments, wallet, and ticketing jobs

- Integrate payment abstraction and sandbox provider when credentials are supplied; otherwise retain a controlled mock gateway.
- Implement payment webhook verification, wallet ledger, background ticketing, retry policies, booking notifications, and failure-recovery workflows.

Acceptance criteria:
- Payment success does not falsely mark booking as ticketed.
- Ticket issuance success creates ticket records and notifications.
- Ticketing failure after payment creates an operations alert and safe recovery state.
- Wallet transactions are immutable and balance calculations are correct.

### Phase 5 — Agent and admin operations

- Complete agent dashboard, reports, wallet controls, admin bookings, agents, pricing rules, reports, supplier settings, audit logs, and cancellation/refund requests.

Acceptance criteria:
- Admin role restrictions are tested.
- Every manual wallet adjustment and pricing-rule change is audited.
- Exports honor data-access permissions.

### Phase 6 — Production readiness

- Add E2E test coverage, performance review, accessibility review, security hardening, observability, dashboards/alerts, backup/restore test, CI completion, deployment documentation, and go-live checklist.

Acceptance criteria:
- CI passes all quality gates.
- Production build succeeds.
- Deployment instructions are reproducible.
- `docs/GO_LIVE_CHECKLIST.md` contains all remaining business, supplier, legal, payment, monitoring, and operational approvals.

## 19. Required documentation and final handover

Before calling the project complete, produce:

- `README.md` with local setup, commands, architecture summary, and development workflow.
- `docs/ARCHITECTURE.md` with system diagram, module boundaries, data flow, RBAC matrix, and external integrations.
- `docs/API_CONTRACT.md` with endpoint documentation and external-provider mapping.
- `docs/SECURITY.md` with threat model, controls, secrets handling, PII policy, and incident response steps.
- `docs/OPERATIONS.md` with booking/ticketing failure handling, job retries, wallet reconciliation, support procedures, and monitoring alerts.
- `docs/GO_LIVE_CHECKLIST.md` including supplier production credentials/certification, payment production activation, legal content, privacy policy, terms, refund policy, data protection obligations, domain/TLS, email verification, backups, monitoring, rate limits, and staff training.
- `docs/BUILD_LOG.md` with phase-by-phase evidence.
- `.env.example`.
- Seed/demo credentials only for local development, explicitly labelled and disabled in production.

## 20. Final delivery checklist

Do not state “production ready” unless all applicable checks pass:

- All production secrets are configured in a proper secrets manager.
- A real supplier contract, documented API access, sandbox validation, and production approval are in place.
- Payment provider production account and verified webhook are live.
- All legal/commercial conditions, travel-agency licensing/accreditation requirements, consumer disclosures, taxes, refund policy, privacy requirements, and data-processing obligations have been reviewed by the client’s qualified legal/compliance advisers.
- TLS, domain, email sender verification, monitoring, backups, alerting, and incident contacts are configured.
- Database migration, restore, ticketing-failure, webhook replay, and rollback procedures have been tested.
- Critical flows have passed manual UAT using sandbox/test data.
- No secret is committed to the repository.
- No mocked supplier or payment mode can accidentally be used in production.
- The client has approved the launch checklist.

Start now with Phase 0. First output a concise implementation plan, list the project inputs still needed, and state the exact folders/files you will create. Then implement phase by phase without skipping tests or documentation.
```

---

## Important note on IATA access

Use the prompt exactly as written until you receive the actual supplier documentation. IATA is an airline industry trade association with products/services and accreditation-related programs; its public home page does not itself provide universal flight-search, booking, or ticket-issuance credentials. Your client still needs a commercial agreement and approved technical access from the specific supplier, GDS, NDC provider, consolidator, or IATA service they intend to use. [web:16]

## Before you give it to an AI coder

Replace the fields below first:

- `[PROJECT_NAME]` and `[COMPANY_NAME]`
- `[SUPPLIER_NAME]` and `[SUPPLIER_API_DOCUMENTATION_URL]`
- Sandbox and production API base URLs
- Payment provider and its API documentation
- Brand details, domain, support email, and operating currency
- Whether agents use a prepaid wallet, credit limit, or both

Do **not** place actual API keys in the prompt, chat history, Git repository, or frontend `.env` file. Put them only in your hosting platform’s secret manager or local untracked environment file.
