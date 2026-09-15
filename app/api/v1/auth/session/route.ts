import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const session = await requireAuthenticatedUser();
    return NextResponse.json({
      success: true,
      data: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        isInternalStaff: session.isInternalStaff,
        role: session.role,
        agencyId: session.agencyId,
        agencyStatus: session.agencyStatus,
        permissions: session.permissions,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Unauthorized",
      },
      { status: 401 }
    );
  }
}
