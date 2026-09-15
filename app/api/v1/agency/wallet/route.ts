import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser, requireActiveAgency } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { WalletService } from "@/lib/wallet/wallet-service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthenticatedUser();
    if (!session.agencyId) {
      return NextResponse.json(
        { success: false, error: "User is not associated with an accredited agency." },
        { status: 403 }
      );
    }

    const wallet = await WalletService.getOrCreateWallet(session.agencyId);

    const transactions = await prisma.walletLedgerEntry.findMany({
      where: { agencyId: session.agencyId },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    return NextResponse.json({
      success: true,
      data: {
        wallet: {
          id: wallet.id,
          currency: wallet.currency,
          availableBalanceMinor: wallet.availableBalanceMinor,
          heldBalanceMinor: wallet.heldBalanceMinor,
          status: wallet.status,
        },
        transactions,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve wallet information" },
      { status: err.message?.includes("UNAUTHORIZED") ? 401 : 500 }
    );
  }
}
