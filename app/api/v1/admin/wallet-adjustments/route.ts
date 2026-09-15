import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireRecentMfa } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import crypto from "crypto";

const AdjustmentSchema = z.object({
  agencyId: z.string().uuid(),
  type: z.enum(["CREDIT", "DEBIT"]),
  amountMinor: z.number().int().positive(),
  reason: z.string().min(5),
});

export async function GET(req: NextRequest) {
  try {
    await requirePermission("wallet.read");

    const adjustments = await prisma.walletAdjustment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: adjustments,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve adjustments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requirePermission("wallet.adjust");
    await requireRecentMfa();

    const body = await req.json();
    const validated = AdjustmentSchema.parse(body);

    const ref = `PN-ADJ-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const adj = await prisma.walletAdjustment.create({
      data: {
        reference: ref,
        agencyId: validated.agencyId,
        type: validated.type,
        amountMinor: validated.amountMinor,
        currency: "USD",
        reason: validated.reason,
        status: "PENDING_APPROVAL",
        initiatedByUserId: session.userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.userId,
        agencyId: validated.agencyId,
        action: "WALLET_ADJUSTMENT_INITIATED",
        resourceType: "WALLET_ADJUSTMENT",
        resourceId: adj.id,
        outcome: "SUCCESS",
        reason: `Initiated ${validated.type} adjustment of $${(validated.amountMinor / 100).toFixed(2)} pending second-officer approval`,
      },
    });

    return NextResponse.json({
      success: true,
      data: adj,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initiate adjustment" },
      { status: err.message?.includes("FORBIDDEN") ? 403 : 400 }
    );
  }
}
