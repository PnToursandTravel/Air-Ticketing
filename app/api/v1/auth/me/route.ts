import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";

export async function GET() {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user,
  });
}
