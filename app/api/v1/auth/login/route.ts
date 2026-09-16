import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AuthService } from "@/lib/auth/auth-service";
import { Prisma } from "@prisma/client";
import { parseRequestBody } from "@/lib/utils";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  roleCategory: z.enum(["ADMIN", "AGENT", "CUSTOMER"]).default("CUSTOMER"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await parseRequestBody<any>(req, {});
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
    // 1. Zod Validation Errors
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input. Please provide a valid email and password.",
        },
        { status: 400 }
      );
    }

    // 2. Prisma Database Errors (Connection, File Access, Locks, etc.)
    if (
      err instanceof Prisma.PrismaClientInitializationError ||
      err instanceof Prisma.PrismaClientKnownRequestError ||
      err instanceof Prisma.PrismaClientUnknownRequestError ||
      err instanceof Prisma.PrismaClientRustPanicError ||
      (typeof err?.message === "string" && (err.message.includes("Unable to open the database file") || err.message.includes("Can't reach database server")))
    ) {
      // Securely log internal database diagnostic on server
      console.error("[Database Connection Error in /api/v1/auth/login]:", err.message);

      return NextResponse.json(
        {
          success: false,
          error: "Database service is currently unavailable. Please verify connectivity or contact the administrator.",
        },
        { status: 503 }
      );
    }

    // 3. Authorization / Insufficient Privileges
    if (typeof err?.message === "string" && err.message.includes("Access denied")) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
        },
        { status: 403 }
      );
    }

    // 4. Authentication Credential Mismatch
    if (typeof err?.message === "string" && (err.message.includes("Invalid email or password") || err.message.includes("Account is inactive"))) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address or password.",
        },
        { status: 401 }
      );
    }

    // 5. Unexpected Server Error (Never leak raw stack/db trace to client)
    console.error("[Unexpected Authentication Error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during authentication. Please try again later.",
      },
      { status: 500 }
    );
  }
}
