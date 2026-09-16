import { NextRequest, NextResponse } from "next/server";
import { SupplierTicketService } from "@/lib/pricing/supplier-ticket-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scope = body.scope || "ALL_UNSOLD"; // "ALL_UNSOLD" | "SELECTED" | "SINGLE"
    const ticketIds = Array.isArray(body.ticketIds) ? body.ticketIds : body.ticketId ? [body.ticketId] : [];

    const result = await SupplierTicketService.recalculateTickets({
      scope,
      ticketIds,
      actorEmail: "operations@pntoursandtravel.com",
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Recalculated ${result.recalculatedCount} unsold tickets using ${result.markupUsed}% markup. ${result.skippedCount} paid/ticketed bookings kept safe.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to recalculate tickets" },
      { status: 500 }
    );
  }
}
