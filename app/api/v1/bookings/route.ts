import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BookingService } from "@/lib/bookings/booking-service";
import { flightProvider } from "@/lib/flights/mock-provider";

const CreateBookingSchema = z.object({
  offerId: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(5),
  passengers: z.array(
    z.object({
      type: z.enum(["ADULT", "CHILD", "INFANT"]),
      title: z.enum(["MR", "MRS", "MS", "MISS", "MSTR"]),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      dateOfBirth: z.string(),
      gender: z.enum(["MALE", "FEMALE"]),
      passportNumber: z.string().optional(),
      passportExpiry: z.string().optional(),
      nationality: z.string().optional(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateBookingSchema.parse(body);

    const offer = await flightProvider.getOffer(validated.offerId);
    if (!offer) {
      return NextResponse.json(
        { success: false, error: "Offer not found or expired" },
        { status: 404 }
      );
    }

    const booking = BookingService.createBookingDraft(
      offer,
      validated.passengers,
      { email: validated.contactEmail, phone: validated.contactPhone }
    );

    return NextResponse.json({
      success: true,
      data: booking,
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
        error: error.message || "Failed to create booking draft",
      },
      { status: 400 }
    );
  }
}
