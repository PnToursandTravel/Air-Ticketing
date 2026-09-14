import { NextResponse } from "next/server";
import { flightProvider } from "@/lib/flights/mock-provider";

export async function GET() {
  const supplierStatus = await flightProvider.healthCheck();

  return NextResponse.json({
    status: "HEALTHY",
    timestamp: new Date().toISOString(),
    services: {
      api: "ONLINE",
      database: "CONNECTED",
      cache: "READY",
      supplier: supplierStatus,
    },
    version: "1.0.0",
  });
}
