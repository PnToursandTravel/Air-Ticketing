import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("wallet.read");

    const wallets = await prisma.wallet.findMany({
      include: {
        agency: {
          select: {
            id: true,
            reference: true,
            name: true,
            status: true,
            contactEmail: true,
          },
        },
      },
      orderBy: { availableBalanceMinor: "desc" },
    });

    const fundingRequests = await prisma.walletFundingRequest.findMany({
      where: { status: "SUBMITTED" },
      include: {
        agency: {
          select: { name: true, reference: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        wallets,
        pendingFundingRequests: fundingRequests,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve wallets" },
      { status: err.message?.includes("FORBIDDEN") ? 403 : 500 }
    );
  }
}
