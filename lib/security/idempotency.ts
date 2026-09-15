import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";

export interface IdempotentExecutionResult<T> {
  cached: boolean;
  data: T;
  statusCode: number;
}

export class IdempotencyService {
  /**
   * Generates a deterministic sha256 hash from request payload.
   */
  static hashPayload(payload: any): string {
    const serialized = typeof payload === "string" ? payload : JSON.stringify(payload || {});
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  /**
   * Executes an action with idempotency enforcement.
   * If the key already completed with matching request hash, returns the cached result.
   * If the key was already used with a different request hash, throws a conflict error.
   */
  static async run<T>(
    key: string | null | undefined,
    actionName: string,
    payload: any,
    actorUserId: string | null,
    operation: () => Promise<{ data: T; statusCode?: number }>
  ): Promise<IdempotentExecutionResult<T>> {
    // If no key supplied, execute directly
    if (!key) {
      const res = await operation();
      return { cached: false, data: res.data, statusCode: res.statusCode || 200 };
    }

    const cleanKey = key.trim();
    const requestHash = this.hashPayload(payload);

    // 1. Check existing record
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key: cleanKey },
    });

    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new Error("IDEMPOTENCY_CONFLICT: Key was previously used with a different request payload.");
      }

      if (existing.responseBodyJson) {
        try {
          const parsed = JSON.parse(existing.responseBodyJson) as T;
          return {
            cached: true,
            data: parsed,
            statusCode: existing.responseStatusCode || 200,
          };
        } catch {
          // If parse fails, fall through to re-execute
        }
      }
    }

    // 2. Execute operation
    const result = await operation();
    const statusCode = result.statusCode || 200;

    // 3. Persist idempotency record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24-hour window
    try {
      await prisma.idempotencyKey.upsert({
        where: { key: cleanKey },
        update: {
          responseStatusCode: statusCode,
          responseBodyJson: JSON.stringify(result.data),
          expiresAt,
        },
        create: {
          key: cleanKey,
          actorUserId,
          action: actionName,
          requestHash,
          responseStatusCode: statusCode,
          responseBodyJson: JSON.stringify(result.data),
          expiresAt,
        },
      });
    } catch (err) {
      console.warn("[Idempotency] Notice persisting key:", err);
    }

    return {
      cached: false,
      data: result.data,
      statusCode,
    };
  }
}
