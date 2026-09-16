import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { flightProvider } from "@/lib/flights/mock-provider";
import { SupplierTicketService } from "@/lib/pricing/supplier-ticket-service";
import { calculateTicketMarkup } from "@/lib/pricing/bulk-markup-engine";

const SearchSchema = z.object({
  tripType: z.enum(["ONE_WAY", "ROUND_TRIP"]).default("ROUND_TRIP"),
  originCode: z.string().min(3).max(3),
  destinationCode: z.string().min(3).max(3),
  departureDate: z.string(),
  returnDate: z.string().optional(),
  cabinClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"]).default("ECONOMY"),
  passengers: z.object({
    adults: z.number().min(1).default(1),
    children: z.number().min(0).default(0),
    infants: z.number().min(0).default(0),
  }),
  currency: z.enum(["USD", "UGX", "EUR", "GBP", "KES"]).default("USD"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = SearchSchema.parse(body);

    const response = await flightProvider.searchFlights(validated as any);

    // Apply active bulk markup engine settings to supplier offers
    try {
      const markupSettings = await SupplierTicketService.getMarkupSettings();
      const rules = await SupplierTicketService.getActivePricingRules();

      response.offers = response.offers.map((offer) => {
        const supplierCostMinor =
          offer.price.baseFareMinor + offer.price.taxesMinor + offer.price.feesMinor;

        const calc = calculateTicketMarkup(
          {
            supplierPriceMinor: supplierCostMinor,
            currency: offer.price.currency,
            airline: offer.validatingAirlineName,
            airlineCode: offer.validatingAirlineCode,
            cabinClass: offer.cabinClass,
          },
          rules,
          markupSettings.defaultMarkupPercent,
          markupSettings.isAutomaticEnabled
        );

        // Strip internal margins from public customer response
        return {
          ...offer,
          price: {
            ...offer.price,
            adminMarkupMinor: 0,
            agentMarkupMinor: 0,
            totalMinor: calc.customerPriceMinor,
          },
        };
      });
    } catch {
      // Fallback to provider pricing if DB temporarily unreachable
    }

    return NextResponse.json({
      success: true,
      data: response,
      error: null,
      meta: {
        requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error.message || "Invalid flight search parameters",
      },
      { status: 400 }
    );
  }
}
