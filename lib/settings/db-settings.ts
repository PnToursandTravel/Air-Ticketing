import { prisma } from "@/lib/db/prisma";

export interface SystemConfigItem {
  id: string;
  category: string;
  configKey: string;
  configValue: string;
  displayValue: string;
  isSecret: boolean;
  description: string | null;
  updatedAt: string;
}

export class DbSettingsService {
  /**
   * Mask secret keys so they are safe to view on admin screens
   */
  static maskSecret(val: string): string {
    if (!val || val.length <= 8) return "••••••••";
    const prefix = val.substring(0, 4);
    const suffix = val.substring(val.length - 4);
    return `${prefix}••••••••${suffix}`;
  }

  /**
   * Fetch all configurations from database with masked values for UI
   */
  static async getAllConfigs(): Promise<SystemConfigItem[]> {
    try {
      const items = await prisma.apiSecurityConfig.findMany({
        orderBy: [{ category: "asc" }, { configKey: "asc" }],
      });

      return items.map((item) => ({
        id: item.id,
        category: item.category,
        configKey: item.configKey,
        configValue: item.configValue,
        displayValue: item.isSecret ? this.maskSecret(item.configValue) : item.configValue,
        isSecret: item.isSecret,
        description: item.description,
        updatedAt: item.updatedAt.toISOString(),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Fetch a single configuration value by key (returns raw value for server-side provider usage)
   */
  static async getConfigValue(key: string, fallback: string = ""): Promise<string> {
    try {
      const item = await prisma.apiSecurityConfig.findUnique({
        where: { configKey: key },
      });
      return item?.configValue || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Update configuration in database and record immutable audit event
   */
  static async updateConfig(
    key: string,
    newValue: string,
    actorId: string,
    actorEmail: string,
    ipAddress?: string
  ) {
    if (!newValue || newValue.trim().length === 0) {
      throw new Error("Configuration value cannot be empty");
    }

    const updated = await prisma.apiSecurityConfig.update({
      where: { configKey: key },
      data: {
        configValue: newValue.trim(),
        updatedBy: actorId,
      },
    });

    // Write immutable audit log to database
    await prisma.auditLog.create({
      data: {
        actorId,
        actorEmail,
        action: "UPDATE_API_SECURITY_CONFIG",
        target: key,
        details: `Updated configuration key: ${key}. Secret: ${updated.isSecret}`,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });

    return updated;
  }
}
