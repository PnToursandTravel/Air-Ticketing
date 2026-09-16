import { NextRequest, NextResponse } from "next/server";
import { SupplierTicketService } from "@/lib/pricing/supplier-ticket-service";
import { calculateTicketMarkup } from "@/lib/pricing/bulk-markup-engine";
import { parseRequestBody } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await SupplierTicketService.getMarkupSettings();

    // Generate clear live sample calculation for USD 500 ticket
    const sample = calculateTicketMarkup(
      {
        supplierPriceMinor: 50000, // $500.00
        currency: "USD",
      },
      [],
      settings.defaultMarkupPercent,
      settings.isAutomaticEnabled
    );

    return NextResponse.json({
      success: true,
      data: {
        id: settings.id,
        defaultMarkupPercent: settings.defaultMarkupPercent,
        isAutomaticEnabled: settings.isAutomaticEnabled,
        updatedAt: settings.updatedAt,
        sampleCalculation: {
          sampleSupplierPrice: "$500.00",
          markupPercentage: `${sample.markupPercentage}%`,
          profitAmount: `$${(sample.profitMinor / 100).toFixed(2)}`,
          customerPrice: `$${(sample.customerPriceMinor / 100).toFixed(2)}`,
          status: settings.isAutomaticEnabled ? "ON" : "OFF",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch markup settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await parseRequestBody<any>(req, {});

    if (body.defaultMarkupPercent === undefined || isNaN(Number(body.defaultMarkupPercent))) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid markup percentage." },
        { status: 400 }
      );
    }

    const percent = Number(body.defaultMarkupPercent);
    if (percent < 0 || percent > 500) {
      return NextResponse.json(
        { success: false, error: "Markup percentage must be between 0% and 500%." },
        { status: 400 }
      );
    }

    const isAutomaticEnabled =
      body.isAutomaticEnabled !== undefined ? Boolean(body.isAutomaticEnabled) : true;

    const updated = await SupplierTicketService.updateMarkupSettings({
      defaultMarkupPercent: percent,
      isAutomaticEnabled,
      actorEmail: "operations@pntoursandtravel.com",
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Markup settings saved. Automatic Markup: ${
        isAutomaticEnabled ? "ON" : "OFF"
      } (${percent}%)`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update markup settings" },
      { status: 500 }
    );
  }
}

export const POST = PUT;

