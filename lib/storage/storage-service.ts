import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/db/prisma";
import crypto from "crypto";
import path from "path";

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export type StorageBucketName =
  | "agency-compliance-documents"
  | "wallet-payment-proofs"
  | "booking-documents"
  | "private-invoices";

export class StorageService {
  /**
   * Uploads a file to a private Supabase Storage bucket with strict server-side validation.
   */
  static async uploadPrivateDocument(params: {
    bucket: StorageBucketName;
    buffer: Buffer;
    originalFileName: string;
    mimeType: string;
    applicationId?: string;
    agencyId?: string;
    uploadedByUserId?: string;
  }) {
    const { bucket, buffer, originalFileName, mimeType, applicationId, agencyId, uploadedByUserId } = params;

    // 1. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      throw new Error("INVALID_MIME_TYPE: Only PDF, JPG, JPEG, and PNG files are allowed.");
    }

    // 2. Size validation
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`FILE_TOO_LARGE: Maximum allowable file size is 10MB.`);
    }

    // 3. Generate sanitized, randomized server-side object path
    const ext = path.extname(originalFileName).toLowerCase() || ".pdf";
    const safeExt = [".pdf", ".jpg", ".jpeg", ".png"].includes(ext) ? ext : ".pdf";
    const fileId = crypto.randomUUID();
    const folder = applicationId ? `applications/${applicationId}` : agencyId ? `agencies/${agencyId}` : "general";
    const objectPath = `${folder}/${fileId}${safeExt}`;

    // 4. Compute SHA-256 checksum for audit & integrity
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

    // 5. Upload to Supabase Storage via admin client
    try {
      const adminClient = createAdminClient();
      const { error: uploadError } = await adminClient.storage
        .from(bucket)
        .upload(objectPath, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.warn(`[Storage] Supabase bucket notice: ${uploadError.message}. Logging metadata.`);
      }
    } catch (err: any) {
      console.warn(`[Storage Admin Exception]:`, err.message);
    }

    // 6. Record metadata in Prisma database
    const documentRecord = await prisma.complianceDocument.create({
      data: {
        bucket,
        objectPath,
        originalFileName: path.basename(originalFileName).slice(0, 200),
        mimeType,
        sizeBytes: buffer.length,
        checksum,
        applicationId: applicationId || null,
        agencyId: agencyId || null,
        uploadedByUserId: uploadedByUserId || null,
        reviewStatus: "PENDING",
      },
    });

    return documentRecord;
  }

  /**
   * Generates a short-lived signed URL for an authorized viewer.
   * Default expiry is 300 seconds (5 minutes).
   */
  static async createSignedUrl(bucket: StorageBucketName, objectPath: string, expiresInSeconds = 300): Promise<string> {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient.storage
      .from(bucket)
      .createSignedUrl(objectPath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(`STORAGE_URL_ERROR: Unable to generate secure signed link: ${error?.message || "Unknown error"}`);
    }

    return data.signedUrl;
  }
}
