import {
  CancelResult,
  FlightSearchRequest,
  FlightSearchResponse,
  IFlightProvider,
  OrderCreateRequest,
  ProviderBookingResult,
  RefundQuote,
  RevalidationResult,
  SupplierHealthStatus,
  TicketingResult,
} from "./provider-interface";
import { CabinClass, Currency, FlightOffer, FlightSegment } from "@/types";
import { convertCurrency } from "@/lib/utils";

interface AirlineProfile {
  code: string;
  name: string;
  ticketPrefix: string;
  hubAirport: string;
  aircraftTypes: string[];
}

const AIRLINES: Record<string, AirlineProfile> = {
  EK: {
    code: "EK",
    name: "Emirates",
    ticketPrefix: "176",
    hubAirport: "DXB",
    aircraftTypes: ["Boeing 777-300ER", "Airbus A380-800"],
  },
  UR: {
    code: "UR",
    name: "Uganda Airlines",
    ticketPrefix: "287",
    hubAirport: "EBB",
    aircraftTypes: ["Airbus A330-800neo", "Bombardier CRJ-900"],
  },
  KQ: {
    code: "KQ",
    name: "Kenya Airways",
    ticketPrefix: "706",
    hubAirport: "NBO",
    aircraftTypes: ["Boeing 787-8 Dreamliner", "Boeing 737-800"],
  },
  QR: {
    code: "QR",
    name: "Qatar Airways",
    ticketPrefix: "157",
    hubAirport: "DOH",
    aircraftTypes: ["Airbus A350-900", "Boeing 787-9 Dreamliner"],
  },
  ET: {
    code: "ET",
    name: "Ethiopian Airlines",
    ticketPrefix: "071",
    hubAirport: "ADD",
    aircraftTypes: ["Airbus A350-900", "Boeing 787-8"],
  },
  KL: {
    code: "KL",
    name: "KLM Royal Dutch Airlines",
    ticketPrefix: "074",
    hubAirport: "AMS",
    aircraftTypes: ["Boeing 777-200ER", "Airbus A330-300"],
  },
  BA: {
    code: "BA",
    name: "British Airways",
    ticketPrefix: "125",
    hubAirport: "LHR",
    aircraftTypes: ["Boeing 777-200", "Airbus A350-1000"],
  },
  TK: {
    code: "TK",
    name: "Turkish Airlines",
    ticketPrefix: "235",
    hubAirport: "IST",
    aircraftTypes: ["Airbus A350-900", "Boeing 787-9"],
  },
};

// Internal store for generated offers and mock orders
const offerStore = new Map<string, FlightOffer>();
const bookingStore = new Map<string, { pnr: string; offer: FlightOffer; order: OrderCreateRequest }>();

export class MockFlightProvider implements IFlightProvider {
  async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
    const searchId = `sch_${Math.random().toString(36).substring(2, 9)}`;
    const currency = request.currency || "USD";
    const offers: FlightOffer[] = [];

    // Select candidate airlines
    const candidateAirlines = Object.values(AIRLINES);

    candidateAirlines.forEach((airline, index) => {
      const isDirect =
        (request.originCode === "EBB" && airline.code === "UR") ||
        (request.originCode === "EBB" && request.destinationCode === "DXB" && airline.code === "EK") ||
        (request.originCode === "EBB" && request.destinationCode === "NBO" && airline.code === "KQ") ||
        index % 3 === 0;

      const offerId = `off_${airline.code.toLowerCase()}_${Math.random().toString(36).substring(2, 8)}`;

      // Base fare calculation
      let baseFareUSD = 380 + (index * 65);
      if (request.cabinClass === "BUSINESS") baseFareUSD *= 3.2;
      if (request.cabinClass === "FIRST") baseFareUSD *= 5.5;
      if (request.cabinClass === "PREMIUM_ECONOMY") baseFareUSD *= 1.6;
      if (request.tripType === "ROUND_TRIP") baseFareUSD *= 1.85;

      const paxMultiplier =
        request.passengers.adults +
        request.passengers.children * 0.75 +
        request.passengers.infants * 0.15;

      const baseMinorUSD = Math.round(baseFareUSD * 100 * (paxMultiplier || 1));
      const taxesMinorUSD = Math.round(baseMinorUSD * 0.18);
      const feesMinorUSD = 2500; // $25

      const baseMinor = convertCurrency(baseMinorUSD, currency);
      const taxesMinor = convertCurrency(taxesMinorUSD, currency);
      const feesMinor = convertCurrency(feesMinorUSD, currency);
      const totalMinor = baseMinor + taxesMinor + feesMinor;

      // Departure and arrival generation
      const depHour = 8 + (index * 2) % 14;
      const depTime = new Date(`${request.departureDate}T${depHour.toString().padStart(2, "0")}:30:00Z`);
      const flightDurationMinutes = isDirect ? 310 : 490 + (index * 25);
      const arrTime = new Date(depTime.getTime() + flightDurationMinutes * 60000);

      const segments: FlightSegment[] = [];

      if (isDirect) {
        segments.push({
          id: `seg_${offerId}_1`,
          airlineCode: airline.code,
          airlineName: airline.name,
          flightNumber: `${airline.code}${300 + index * 12}`,
          aircraft: airline.aircraftTypes[0],
          originAirport: request.originCode,
          destinationAirport: request.destinationCode,
          departureTime: depTime.toISOString(),
          arrivalTime: arrTime.toISOString(),
          durationMinutes: flightDurationMinutes,
          cabinClass: request.cabinClass,
          baggageAllowance: request.cabinClass === "BUSINESS" ? "2 x 32kg Checked Bags" : "2 x 23kg Checked Bags",
          stops: 0,
        });
      } else {
        // Layover at hub
        const leg1Duration = Math.round(flightDurationMinutes * 0.45);
        const layoverMinutes = 90 + (index % 4) * 30;
        const leg2Duration = flightDurationMinutes - leg1Duration - layoverMinutes;

        const hubArrTime = new Date(depTime.getTime() + leg1Duration * 60000);
        const hubDepTime = new Date(hubArrTime.getTime() + layoverMinutes * 60000);

        segments.push({
          id: `seg_${offerId}_1`,
          airlineCode: airline.code,
          airlineName: airline.name,
          flightNumber: `${airline.code}${400 + index * 10}`,
          aircraft: airline.aircraftTypes[0],
          originAirport: request.originCode,
          destinationAirport: airline.hubAirport,
          departureTime: depTime.toISOString(),
          arrivalTime: hubArrTime.toISOString(),
          durationMinutes: leg1Duration,
          cabinClass: request.cabinClass,
          baggageAllowance: "2 x 23kg Checked Bags",
          stops: 0,
        });

        segments.push({
          id: `seg_${offerId}_2`,
          airlineCode: airline.code,
          airlineName: airline.name,
          flightNumber: `${airline.code}${500 + index * 10}`,
          aircraft: airline.aircraftTypes[1] || airline.aircraftTypes[0],
          originAirport: airline.hubAirport,
          destinationAirport: request.destinationCode,
          departureTime: hubDepTime.toISOString(),
          arrivalTime: arrTime.toISOString(),
          durationMinutes: leg2Duration,
          cabinClass: request.cabinClass,
          baggageAllowance: "2 x 23kg Checked Bags",
          stops: 0,
        });
      }

      const offer: FlightOffer = {
        id: offerId,
        provider: "MockFlightEngine",
        validatingAirlineCode: airline.code,
        validatingAirlineName: airline.name,
        outboundSegments: segments,
        totalDurationMinutes: flightDurationMinutes,
        stops: isDirect ? 0 : 1,
        cabinClass: request.cabinClass,
        fareBasisCode: `${request.cabinClass[0]}FLEX26`,
        fareFamilyName: request.cabinClass === "BUSINESS" ? "Business Flex" : "Economy Standard",
        baggageAllowance: request.cabinClass === "BUSINESS" ? "2 x 32kg Checked Bags" : "2 x 23kg Checked Bags",
        refundable: index % 2 === 0,
        changeAllowed: true,
        seatsRemaining: 4 + (index % 5),
        price: {
          currency,
          baseFareMinor: baseMinor,
          taxesMinor: taxesMinor,
          feesMinor: feesMinor,
          adminMarkupMinor: 0,
          agentMarkupMinor: 0,
          totalMinor: totalMinor,
        },
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes offer TTL
      };

      offerStore.set(offerId, offer);
      offers.push(offer);
    });

    return {
      searchId,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      offers: offers.sort((a, b) => a.price.totalMinor - b.price.totalMinor),
    };
  }

  async getOffer(offerId: string): Promise<FlightOffer | null> {
    return offerStore.get(offerId) || null;
  }

  async revalidateOffer(offerId: string): Promise<RevalidationResult> {
    const offer = offerStore.get(offerId);
    if (!offer) {
      return { valid: false, priceChanged: false, soldOut: true, message: "Offer has expired or is no longer available" };
    }

    // Check expiry
    if (new Date(offer.expiresAt).getTime() < Date.now()) {
      return { valid: false, priceChanged: false, soldOut: true, message: "Offer session expired. Please refresh search." };
    }

    return { valid: true, priceChanged: false, soldOut: false, updatedOffer: offer };
  }

  async createOrder(request: OrderCreateRequest): Promise<ProviderBookingResult> {
    const offer = offerStore.get(request.offerId);
    if (!offer) {
      throw new Error("Invalid offer or offer expired");
    }

    const pnr = `PN${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(10 + Math.random() * 89)}`;
    const providerBookingId = `pbk_${Math.random().toString(36).substring(2, 10)}`;

    bookingStore.set(providerBookingId, { pnr, offer, order: request });

    return {
      providerBookingId,
      pnr,
      status: "CONFIRMED",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async issueTicket(providerBookingId: string): Promise<TicketingResult> {
    const booking = bookingStore.get(providerBookingId);
    const airline = booking ? AIRLINES[booking.offer.validatingAirlineCode] : AIRLINES.UR;
    const prefix = airline ? airline.ticketPrefix : "287";

    const ticketNumbers = (booking?.order.passengers || [{ firstName: "Traveler" }]).map(
      () => `${prefix}-${Math.floor(1000000000 + Math.random() * 9000000000)}`
    );

    return {
      success: true,
      pnr: booking ? booking.pnr : `PN${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      ticketNumbers,
      issuedAt: new Date().toISOString(),
    };
  }

  async cancelBooking(providerBookingId: string): Promise<CancelResult> {
    return {
      success: true,
      cancellationReference: `CAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      penaltyMinor: 5000, // $50 penalty
      refundAmountMinor: 45000,
      currency: "USD",
    };
  }

  async getRefundQuote(providerBookingId: string): Promise<RefundQuote> {
    return {
      refundable: true,
      totalPaidMinor: 55000,
      cancellationFeeMinor: 5000,
      estimatedRefundMinor: 50000,
      currency: "USD",
    };
  }

  async healthCheck(): Promise<SupplierHealthStatus> {
    return {
      providerName: "MockFlightEngine (IATA Agnostic)",
      status: "ONLINE",
      latencyMs: 42,
      mode: "MOCK",
      lastCheckedAt: new Date().toISOString(),
    };
  }
}

export const flightProvider = new MockFlightProvider();
