import {
  BookingRecord,
  BookingStatus,
  FlightOffer,
  Passenger,
  PaymentStatus,
  TicketStatus,
} from "@/types";
import { calculateBookingPrice } from "@/lib/pricing/engine";
import { flightProvider } from "@/lib/flights/mock-provider";

// State transition table
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: ["SEARCHED", "EXPIRED"],
  SEARCHED: ["OFFER_SELECTED", "EXPIRED"],
  OFFER_SELECTED: ["REVALIDATION_REQUIRED", "TRAVELLER_DETAILS_PENDING", "EXPIRED"],
  REVALIDATION_REQUIRED: ["PRICE_CHANGED", "SOLD_OUT", "TRAVELLER_DETAILS_PENDING", "EXPIRED"],
  PRICE_CHANGED: ["OFFER_SELECTED", "EXPIRED"],
  SOLD_OUT: ["SEARCHED", "EXPIRED"],
  TRAVELLER_DETAILS_PENDING: ["PENDING_PAYMENT", "EXPIRED"],
  PENDING_PAYMENT: ["PAYMENT_CONFIRMED", "PAYMENT_FAILED", "EXPIRED"],
  PAYMENT_FAILED: ["PENDING_PAYMENT", "EXPIRED", "FAILED"],
  PAYMENT_CONFIRMED: ["BOOKING_PENDING", "TICKETING_PENDING", "FAILED"],
  BOOKING_PENDING: ["BOOKED", "FAILED"],
  BOOKED: ["TICKETING_PENDING", "CANCEL_REQUESTED"],
  TICKETING_PENDING: ["TICKETED", "TICKETING_FAILED"],
  TICKETED: ["CANCEL_REQUESTED", "REFUND_QUOTE_PENDING"],
  TICKETING_FAILED: ["TICKETING_PENDING", "REFUND_PENDING", "FAILED"],
  CANCEL_REQUESTED: ["CANCELLATION_PENDING", "TICKETED"],
  CANCELLATION_PENDING: ["CANCELLED", "TICKETED"],
  CANCELLED: ["REFUND_PENDING", "REFUNDED"],
  REFUND_QUOTE_PENDING: ["REFUND_REQUESTED", "TICKETED"],
  REFUND_REQUESTED: ["REFUND_PENDING", "TICKETED"],
  REFUND_PENDING: ["REFUNDED", "FAILED"],
  REFUNDED: [],
  FAILED: [],
  EXPIRED: [],
};

// Initial store with seed bookings
const bookingsStore = new Map<string, BookingRecord>();

// Pre-populate with realistic demo records
const seedOffer: FlightOffer = {
  id: "off_ek_demo_01",
  provider: "MockFlightEngine",
  validatingAirlineCode: "EK",
  validatingAirlineName: "Emirates",
  outboundSegments: [
    {
      id: "seg_seed_1",
      airlineCode: "EK",
      airlineName: "Emirates",
      flightNumber: "EK730",
      aircraft: "Boeing 777-300ER",
      originAirport: "EBB",
      destinationAirport: "DXB",
      departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 315 * 60000).toISOString(),
      durationMinutes: 315,
      cabinClass: "ECONOMY",
      baggageAllowance: "2 x 23kg Checked Bags",
      stops: 0,
    },
  ],
  totalDurationMinutes: 315,
  stops: 0,
  cabinClass: "ECONOMY",
  fareBasisCode: "EFLEX26",
  fareFamilyName: "Economy Standard",
  baggageAllowance: "2 x 23kg Checked Bags",
  refundable: true,
  changeAllowed: true,
  seatsRemaining: 7,
  price: {
    currency: "USD",
    baseFareMinor: 52000,
    taxesMinor: 8500,
    feesMinor: 1500,
    adminMarkupMinor: 2000,
    agentMarkupMinor: 0,
    totalMinor: 64000,
  },
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

const initialBookings: BookingRecord[] = [
  {
    id: "bk_demo_01",
    reference: "PN-748921",
    pnr: "PN784K",
    status: "TICKETED",
    paymentStatus: "SUCCEEDED",
    ticketStatus: "ISSUED",
    userId: "usr_customer_01",
    contactEmail: "traveler@example.com",
    contactPhone: "+256 785360444",
    currency: "USD",
    priceSnapshot: seedOffer.price,
    passengers: [
      {
        id: "pax_01",
        type: "ADULT",
        title: "MR",
        firstName: "Denis",
        lastName: "Ayiko",
        dateOfBirth: "1990-05-14",
        gender: "MALE",
        passportNumber: "UG984210",
        passportExpiry: "2031-10-20",
        nationality: "UG",
      },
    ],
    offerSnapshot: seedOffer,
    ticketNumbers: ["176-4892019482"],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bk_demo_02",
    reference: "PN-891042",
    pnr: "PN912M",
    status: "TICKETING_PENDING",
    paymentStatus: "SUCCEEDED",
    ticketStatus: "PENDING",
    userId: "usr_agent_01",
    agencyId: "agency_premier_01",
    contactEmail: "agent@pntoursandtravel.com",
    contactPhone: "+256 785360444",
    currency: "USD",
    priceSnapshot: {
      currency: "USD",
      baseFareMinor: 88000,
      taxesMinor: 12000,
      feesMinor: 2000,
      adminMarkupMinor: 2000,
      agentMarkupMinor: 4000,
      totalMinor: 108000,
    },
    passengers: [
      {
        id: "pax_02",
        type: "ADULT",
        title: "MRS",
        firstName: "Sarah",
        lastName: "Nantongo",
        dateOfBirth: "1988-11-23",
        gender: "FEMALE",
        passportNumber: "UG489102",
        nationality: "UG",
      },
    ],
    offerSnapshot: {
      ...seedOffer,
      validatingAirlineCode: "UR",
      validatingAirlineName: "Uganda Airlines",
    },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

initialBookings.forEach((b) => bookingsStore.set(b.reference, b));

export class BookingService {
  static getAll(): BookingRecord[] {
    return Array.from(bookingsStore.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static getByReference(reference: string): BookingRecord | null {
    return bookingsStore.get(reference.toUpperCase().trim()) || null;
  }

  static getByUserId(userId: string): BookingRecord[] {
    return this.getAll().filter((b) => b.userId === userId);
  }

  static getByAgencyId(agencyId: string): BookingRecord[] {
    return this.getAll().filter((b) => b.agencyId === agencyId);
  }

  static validateTransition(current: BookingStatus, next: BookingStatus): boolean {
    const allowed = ALLOWED_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  static createBookingDraft(
    offer: FlightOffer,
    passengers: Passenger[],
    contact: { email: string; phone: string },
    context: { userId?: string; agencyId?: string; agentMarkupMinor?: number } = {}
  ): BookingRecord {
    const reference = `PN-${Math.floor(100000 + Math.random() * 900000)}`;
    const priceSnapshot = calculateBookingPrice(offer, undefined, {
      agencyId: context.agencyId,
      agentCustomMarkupMinor: context.agentMarkupMinor,
    });

    const booking: BookingRecord = {
      id: `bk_${Math.random().toString(36).substring(2, 9)}`,
      reference,
      status: "PENDING_PAYMENT",
      paymentStatus: "PENDING",
      ticketStatus: "NOT_REQUESTED",
      userId: context.userId || "usr_guest",
      agencyId: context.agencyId,
      contactEmail: contact.email,
      contactPhone: contact.phone,
      currency: priceSnapshot.currency,
      priceSnapshot,
      passengers,
      offerSnapshot: offer,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookingsStore.set(reference, booking);
    return booking;
  }

  static async completePaymentAndIssueTicket(
    reference: string,
    paymentMethod: string = "CARD"
  ): Promise<BookingRecord> {
    const booking = bookingsStore.get(reference);
    if (!booking) throw new Error("Booking not found");

    // Transition to payment confirmed
    booking.paymentStatus = "SUCCEEDED";
    booking.status = "TICKETING_PENDING";
    booking.ticketStatus = "PENDING";
    booking.updatedAt = new Date().toISOString();

    // Call Flight provider to generate order and issue tickets
    try {
      const order = await flightProvider.createOrder({
        offerId: booking.offerSnapshot.id,
        contactEmail: booking.contactEmail,
        contactPhone: booking.contactPhone,
        passengers: booking.passengers,
      });

      const ticketResult = await flightProvider.issueTicket(order.providerBookingId);

      if (ticketResult.success) {
        booking.pnr = ticketResult.pnr;
        booking.ticketNumbers = ticketResult.ticketNumbers;
        booking.status = "TICKETED";
        booking.ticketStatus = "ISSUED";
      } else {
        booking.status = "TICKETING_FAILED";
        booking.ticketStatus = "FAILED";
      }
    } catch {
      booking.status = "TICKETING_FAILED";
      booking.ticketStatus = "FAILED";
    }

    booking.updatedAt = new Date().toISOString();
    bookingsStore.set(reference, booking);
    return booking;
  }

  static async retryTicketing(reference: string): Promise<BookingRecord> {
    const booking = bookingsStore.get(reference);
    if (!booking) throw new Error("Booking not found");

    if (booking.paymentStatus !== "SUCCEEDED") {
      throw new Error("Cannot issue ticket for unpaid booking");
    }

    booking.status = "TICKETING_PENDING";
    booking.ticketStatus = "PENDING";

    const pnr = `PN${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.floor(10 + Math.random() * 89)}`;
    const ticketNumbers = booking.passengers.map(
      () => `287-${Math.floor(1000000000 + Math.random() * 9000000000)}`
    );

    booking.pnr = pnr;
    booking.ticketNumbers = ticketNumbers;
    booking.status = "TICKETED";
    booking.ticketStatus = "ISSUED";
    booking.updatedAt = new Date().toISOString();

    bookingsStore.set(reference, booking);
    return booking;
  }
}
