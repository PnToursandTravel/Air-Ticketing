import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/auth-service";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  roleCategory: z.enum(["ADMIN", "AGENT", "CUSTOMER"]).default("CUSTOMER"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const clientIp = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";

    const result = await AuthService.login(
      validated.email,
      validated.password,
      validated.roleCategory,
      clientIp
    );

    return NextResponse.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Invalid authentication credentials",
      },
      { status: 401 }
    );
  }
}
