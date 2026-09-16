import { NextRequest, NextResponse } from "next/server";
import { SupplierTicketService } from "@/lib/pricing/supplier-ticket-service";

export async function POST(req: NextRequest) {
  try {
    let csvText = "";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file uploaded." },
          { status: 400 }
        );
      }
      csvText = await file.text();
    } else {
      const body = await req.json();
      csvText = body.csvText || "";
    }

    if (!csvText.trim()) {
      return NextResponse.json(
        { success: false, error: "Uploaded CSV is empty." },
        { status: 400 }
      );
    }

    const validationResult = await SupplierTicketService.parseAndValidateCSV(csvText);

    return NextResponse.json({
      success: true,
      data: validationResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to parse and validate CSV" },
      { status: 500 }
    );
  }
}
