import { NextRequest, NextResponse } from "next/server";
import { BookingService } from "@/lib/bookings/booking-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { reference: string } }
) {
  const reference = params.reference;
  const booking = BookingService.getByReference(reference);

  if (!booking) {
    return NextResponse.json(
      { success: false, error: "Booking reference not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: booking,
    error: null,
    meta: {
      requestId: `req_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    },
  });
}
