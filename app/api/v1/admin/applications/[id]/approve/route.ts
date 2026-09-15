import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireRecentMfa } from "@/lib/auth/rbac";
import { AgencyService } from "@/lib/agency/agency-service";
import { IdempotencyService } from "@/lib/security/idempotency";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission("agency.approve");
    await requireRecentMfa();

    const idempotencyKey = req.headers.get("x-idempotency-key");

    const result = await IdempotencyService.run(
      idempotencyKey,
      "APPROVE_AGENCY_APPLICATION",
      { applicationId: params.id },
      session.userId,
      async () => {
        const approved = await AgencyService.approveApplication(params.id, session.userId);
        return { data: approved, statusCode: 200 };
      }
    );

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to approve application" },
      { status: err.message?.includes("FORBIDDEN") ? 403 : 500 }
    );
  }
}
