import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireRecentMfa } from "@/lib/auth/rbac";
import { WalletService } from "@/lib/wallet/wallet-service";
import { IdempotencyService } from "@/lib/security/idempotency";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requirePermission("wallet.adjust.approve");
    await requireRecentMfa();

    const idempotencyKey = req.headers.get("x-idempotency-key");

    const result = await IdempotencyService.run(
      idempotencyKey,
      "APPROVE_WALLET_ADJUSTMENT",
      { adjustmentId: params.id },
      session.userId,
      async () => {
        const approved = await WalletService.approveAdjustment(params.id, session.userId);
        return { data: approved, statusCode: 200 };
      }
    );

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to approve adjustment" },
      { status: err.message?.includes("MAKER_CHECKER") ? 403 : err.message?.includes("FORBIDDEN") ? 403 : 400 }
    );
  }
}
