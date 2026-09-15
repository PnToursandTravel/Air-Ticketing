import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AgencyService } from "@/lib/agency/agency-service";
import { IdempotencyService } from "@/lib/security/idempotency";

const ApplicationSchema = z.object({
  agencyLegalName: z.string().min(2),
  agencyTradeName: z.string().min(2),
  registrationNumber: z.string().min(2),
  taxId: z.string().optional(),
  iataNumber: z.string().optional(),
  tidsNumber: z.string().optional(),
  licenseNumber: z.string().min(2),
  officialEmail: z.string().email(),
  businessPhone: z.string().min(5),
  address: z.string().min(3),
  country: z.string().default("Uganda"),
  website: z.string().url().optional().or(z.literal("")),
  primaryContact: z.object({
    fullName: z.string().min(2),
    position: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(5),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ApplicationSchema.parse(body);
    const idempotencyKey = req.headers.get("x-idempotency-key");

    const result = await IdempotencyService.run(
      idempotencyKey,
      "SUBMIT_AGENCY_APPLICATION",
      validated,
      null,
      async () => {
        const app = await AgencyService.submitApplication(validated);
        return { data: app, statusCode: 201 };
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: result.statusCode }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed. Please verify all required agency and contact fields.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred while submitting your application.",
      },
      { status: 500 }
    );
  }
}
