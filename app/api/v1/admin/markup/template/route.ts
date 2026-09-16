import { NextResponse } from "next/server";

export async function GET() {
  const sampleCSV = `supplier_reference,supplier_name,airline,origin,destination,travel_date,passenger_type,currency,supplier_price
SUP-EK-001,IATA Direct Connect,Emirates,EBB,DXB,2026-10-15,ADULT,USD,500.00
SUP-UR-002,Uganda Airlines Direct,Uganda Airlines,EBB,NBO,2026-10-16,ADULT,USD,300.00
SUP-KQ-003,Kenya Airways GDS,Kenya Airways,EBB,LHR,2026-10-20,ADULT,USD,850.00
SUP-QR-004,Qatar Airways NDC,Qatar Airways,EBB,DOH,2026-10-25,CHILD,USD,420.00
SUP-ET-005,Ethiopian Airlines API,Ethiopian Airlines,EBB,JNB,2026-11-02,ADULT,USD,620.00`;

  return new NextResponse(sampleCSV, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="supplier_tickets_template.csv"',
    },
  });
}
