import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import crypto from "crypto";

const FundingRequestSchema = z.object({
  amountMinor: z.number().int().positive(),
  paymentMethod: z.enum(["BANK_TRANSFER", "CARD", "MOBILE_MONEY"]).default("BANK_TRANSFER"),
  paymentProofDocId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuthenticatedUser();
    if (!session.agencyId) {
      return NextResponse.json(
        { success: false, error: "Access denied. User is not linked to an agency." },
        { status: 403 }
      );
    }

    const requests = await prisma.walletFundingRequest.findMany({
      where: { agencyId: session.agencyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve funding requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuthenticatedUser();
    if (!session.agencyId) {
      return NextResponse.json(
        { success: false, error: "Access denied. User is not linked to an agency." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { amountMinor, paymentMethod, paymentProofDocId } = FundingRequestSchema.parse(body);

    const ref = `PN-FND-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    const fundingRequest = await prisma.walletFundingRequest.create({
      data: {
        reference: ref,
        agencyId: session.agencyId,
        amountMinor,
        currency: "USD",
        paymentMethod,
        paymentProofDocId: paymentProofDocId || null,
        status: "SUBMITTED",
        requestedByUserId: session.userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.userId,
        agencyId: session.agencyId,
        action: "WALLET_FUNDING_REQUESTED",
        resourceType: "WALLET_FUNDING_REQUEST",
        resourceId: fundingRequest.id,
        outcome: "SUCCESS",
        reason: `Agency requested $${(amountMinor / 100).toFixed(2)} top-up via ${paymentMethod}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: fundingRequest,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to submit funding request" },
      { status: 400 }
    );
  }
}
