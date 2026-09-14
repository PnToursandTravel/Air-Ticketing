import { CabinClass, Currency, FlightOffer, Passenger, TripType } from "@/types";

export interface FlightSearchRequest {
  tripType: TripType;
  originCode: string;
  destinationCode: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;    // YYYY-MM-DD
  cabinClass: CabinClass;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  currency?: Currency;
}

export interface FlightSearchResponse {
  searchId: string;
  expiresAt: string;
  offers: FlightOffer[];
}

export interface RevalidationResult {
  valid: boolean;
  priceChanged: boolean;
  soldOut: boolean;
  updatedOffer?: FlightOffer;
  message?: string;
}

export interface OrderCreateRequest {
  offerId: string;
  contactEmail: string;
  contactPhone: string;
  passengers: Passenger[];
}

export interface ProviderBookingResult {
  providerBookingId: string;
  pnr: string;
  status: "CONFIRMED" | "PENDING" | "FAILED";
  expiresAt: string;
}

export interface TicketingResult {
  success: boolean;
  pnr: string;
  ticketNumbers: string[];
  issuedAt: string;
  error?: string;
}

export interface CancelResult {
  success: boolean;
  cancellationReference: string;
  penaltyMinor: number;
  refundAmountMinor: number;
  currency: Currency;
}

export interface RefundQuote {
  refundable: boolean;
  totalPaidMinor: number;
  cancellationFeeMinor: number;
  estimatedRefundMinor: number;
  currency: Currency;
}

export interface SupplierHealthStatus {
  providerName: string;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  latencyMs: number;
  mode: "MOCK" | "SANDBOX" | "PRODUCTION";
  lastCheckedAt: string;
}

export interface IFlightProvider {
  searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse>;
  getOffer(offerId: string): Promise<FlightOffer | null>;
  revalidateOffer(offerId: string): Promise<RevalidationResult>;
  createOrder(request: OrderCreateRequest): Promise<ProviderBookingResult>;
  issueTicket(providerBookingId: string): Promise<TicketingResult>;
  cancelBooking(providerBookingId: string): Promise<CancelResult>;
  getRefundQuote(providerBookingId: string): Promise<RefundQuote>;
  healthCheck(): Promise<SupplierHealthStatus>;
}
