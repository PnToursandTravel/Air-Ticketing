import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requirePermission } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("agency.read");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const applications = await prisma.agencyApplication.findMany({
      where: status ? { status } : undefined,
      include: {
        contacts: true,
        documents: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve agency applications" },
      { status: err.message?.includes("FORBIDDEN") ? 403 : 500 }
    );
  }
}
