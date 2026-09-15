import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("agency.read");

    const agencies = await prisma.agency.findMany({
      include: {
        wallet: true,
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: agencies,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve agencies" },
      { status: err.message?.includes("FORBIDDEN") ? 403 : 500 }
    );
  }
}
