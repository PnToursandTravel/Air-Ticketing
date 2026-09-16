import { NextRequest, NextResponse } from "next/server";
import { SupplierTicketService } from "@/lib/pricing/supplier-ticket-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters = {
      search: searchParams.get("search") || undefined,
      airline: searchParams.get("airline") || undefined,
      currency: searchParams.get("currency") || undefined,
      pricingStatus: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!) : 25,
    };

    const result = await SupplierTicketService.listTickets(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to list supplier tickets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tickets = body.tickets;
    const importedVia = body.importedVia || "MANUAL";

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide an array of tickets to process." },
        { status: 400 }
      );
    }

    const result = await SupplierTicketService.processBulkTickets(tickets, importedVia);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Processed ${result.totalReceived} tickets: ${result.validCount} valid and saved, ${result.errorCount} with errors.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process bulk tickets" },
      { status: 500 }
    );
  }
}
