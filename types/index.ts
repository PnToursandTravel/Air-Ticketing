export type UserRole =
  | "CUSTOMER"
  | "AGENT_OWNER"
  | "AGENT_STAFF"
  | "ADMIN"
  | "FINANCE"
  | "SUPPORT"
  | "OPERATIONS"
  | "SUPER_ADMIN";

export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type TripType = "ONE_WAY" | "ROUND_TRIP";

export type Currency = "USD" | "UGX" | "EUR" | "GBP" | "KES";

export type BookingStatus =
  | "DRAFT"
  | "SEARCHED"
  | "OFFER_SELECTED"
  | "REVALIDATION_REQUIRED"
  | "PRICE_CHANGED"
  | "SOLD_OUT"
  | "TRAVELLER_DETAILS_PENDING"
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "PAYMENT_CONFIRMED"
  | "BOOKING_PENDING"
  | "BOOKED"
  | "TICKETING_PENDING"
  | "TICKETED"
  | "TICKETING_FAILED"
  | "CANCEL_REQUESTED"
  | "CANCELLATION_PENDING"
  | "CANCELLED"
  | "REFUND_QUOTE_PENDING"
  | "REFUND_REQUESTED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "FAILED"
  | "EXPIRED";

export type PaymentStatus =
  | "INITIATED"
  | "PENDING"
  | "AUTHORIZED"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "CHARGEBACK";

export type TicketStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "ISSUED"
  | "FAILED"
  | "VOIDED"
  | "REFUNDED";

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  timezone: string;
}

export interface FlightSegment {
  id: string;
  airlineCode: string;
  airlineName: string;
  airlineLogoUrl?: string;
  flightNumber: string;
  aircraft: string;
  originAirport: string;
  destinationAirport: string;
  departureTime: string; // ISO 8601
  arrivalTime: string;   // ISO 8601
  durationMinutes: number;
  cabinClass: CabinClass;
  baggageAllowance: string;
  stops: number;
}

export interface FlightPriceBreakdown {
  currency: Currency;
  baseFareMinor: number;
  taxesMinor: number;
  feesMinor: number;
  adminMarkupMinor: number;
  agentMarkupMinor: number;
  totalMinor: number;
}

export interface FlightOffer {
  id: string;
  provider: string;
  validatingAirlineCode: string;
  validatingAirlineName: string;
  airlineLogoUrl?: string;
  outboundSegments: FlightSegment[];
  inboundSegments?: FlightSegment[];
  totalDurationMinutes: number;
  stops: number;
  cabinClass: CabinClass;
  fareBasisCode: string;
  fareFamilyName: string;
  baggageAllowance: string;
  refundable: boolean;
  changeAllowed: boolean;
  seatsRemaining: number;
  price: FlightPriceBreakdown;
  expiresAt: string; // ISO 8601
}

export interface Passenger {
  id?: string;
  type: "ADULT" | "CHILD" | "INFANT";
  title: "MR" | "MRS" | "MS" | "MISS" | "MSTR";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
}

export interface ContactDetails {
  email: string;
  phone: string;
  fullName: string;
}

export interface BookingRecord {
  id: string;
  reference: string;
  pnr?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  ticketStatus: TicketStatus;
  userId?: string;
  agencyId?: string;
  contactEmail: string;
  contactPhone: string;
  currency: Currency;
  priceSnapshot: FlightPriceBreakdown;
  passengers: Passenger[];
  offerSnapshot: FlightOffer;
  ticketNumbers?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletLedgerEntry {
  id: string;
  walletId: string;
  type: "DEPOSIT" | "BOOKING_DEBIT" | "REFUND_CREDIT" | "MANUAL_ADJUSTMENT";
  amountMinor: number; // positive for credit, negative for debit
  balanceBeforeMinor: number;
  balanceAfterMinor: number;
  currency: Currency;
  bookingReference?: string;
  description: string;
  actorId: string;
  createdAt: string;
}

export interface Agency {
  id: string;
  name: string;
  iataNumber?: string;
  licenseNumber?: string;
  contactEmail: string;
  contactPhone: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
  walletBalanceMinor: number;
  currency: Currency;
  createdAt: string;
}

export interface PricingRule {
  id: string;
  name: string;
  priority: number;
  type: "FIXED" | "PERCENTAGE";
  amountMinorOrPercent: number; // e.g. 2500 for $25.00 or 5 for 5%
  appliesTo: "GLOBAL" | "AIRLINE" | "ROUTE" | "CABIN" | "AGENT";
  targetCode?: string; // e.g. "EK" or "EBB-DXB" or "BUSINESS" or agencyId
  active: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export type {
  FlightSearchRequest,
  FlightSearchResponse,
  RevalidationResult,
  OrderCreateRequest,
  ProviderBookingResult,
  TicketingResult,
  CancelResult,
  RefundQuote,
  SupplierHealthStatus,
  IFlightProvider,
} from "@/lib/flights/provider-interface";
