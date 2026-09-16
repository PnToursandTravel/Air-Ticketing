import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DbSettingsService } from "@/lib/settings/db-settings";
import { AuthService } from "@/lib/auth/auth-service";
import { parseRequestBody } from "@/lib/utils";

const UpdateConfigSchema = z.object({
  configKey: z.string().min(1),
  newValue: z.string().min(1),
});

export async function GET() {
  const user = await AuthService.getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN", "OPERATIONS"].includes(user.role)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const configs = await DbSettingsService.getAllConfigs();
  return NextResponse.json({ success: true, data: configs });
}

export async function PUT(req: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser();
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await parseRequestBody<any>(req, {});
    const validated = UpdateConfigSchema.parse(body);

    const clientIp = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";

    const updated = await DbSettingsService.updateConfig(
      validated.configKey,
      validated.newValue,
      user.id,
      user.email,
      clientIp
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update configuration" },
      { status: 400 }
    );
  }
}
