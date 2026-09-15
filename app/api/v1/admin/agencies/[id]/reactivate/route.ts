import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireRecentMfa } from "@/lib/auth/rbac";
import { AgencyService } from "@/lib/agency/agency-service";
import { z } from "zod";

const ReactivateSchema = z.object({
  reason: z.string().min(5),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission("agency.reactivate");
    await requireRecentMfa();

    const body = await req.json();
    const { reason } = ReactivateSchema.parse(body);

    const updated = await AgencyService.reactivateAgency(params.id, reason, session.userId);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to reactivate agency" },
      { status: err.message?.includes("FORBIDDEN") ? 403 : 500 }
    );
  }
}
