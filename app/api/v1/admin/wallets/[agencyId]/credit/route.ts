import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireRecentMfa } from "@/lib/auth/rbac";
import { WalletService } from "@/lib/wallet/wallet-service";
import { IdempotencyService } from "@/lib/security/idempotency";
import { z } from "zod";

const CreditSchema = z.object({
  amountMinor: z.number().int().positive(),
  reason: z.string().min(3),
  fundingRequestId: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { agencyId: string } }
) {
  try {
    const session = await requirePermission("wallet.credit");
    await requireRecentMfa();

    const body = await req.json();
    const validated = CreditSchema.parse(body);
    const idempotencyKey = req.headers.get("x-idempotency-key");

    const result = await IdempotencyService.run(
      idempotencyKey,
      "CREDIT_WALLET",
      { agencyId: params.agencyId, ...validated },
      session.userId,
      async () => {
        const creditRes = await WalletService.creditWallet(
          params.agencyId,
          validated.amountMinor,
          validated.reason,
          session.userId,
          validated.fundingRequestId
        );
        return { data: creditRes, statusCode: 200 };
      }
    );

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to credit agency wallet" },
      { status: err.message?.includes("FORBIDDEN") ? 403 : 500 }
    );
  }
}
