import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { trackingId: string } }
) {
  try {
    const trackingId = params.trackingId.trim().toUpperCase();

    const app = await prisma.agencyApplication.findUnique({
      where: { trackingId },
      select: {
        trackingId: true,
        agencyTradeName: true,
        status: true,
        statusReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!app) {
      return NextResponse.json(
        { success: false, error: "Application tracking ID not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: app,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Unable to retrieve application status." },
      { status: 500 }
    );
  }
}
