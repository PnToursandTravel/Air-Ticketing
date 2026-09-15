import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { createAdminClient } from "../lib/supabase/admin";

const prisma = new PrismaClient();

const DISALLOWED_PASSWORDS = [
  "password",
  "admin",
  "admin123",
  "Admin@123",
  "Admin@PN2026!",
  "change-me",
];

async function bootstrapSuperAdmin() {
  console.log("=== PN Tours and Travel: Super Admin Bootstrap ===");

  const email = process.env.INITIAL_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.INITIAL_SUPER_ADMIN_NAME?.trim();
  const password = process.env.INITIAL_SUPER_ADMIN_PASSWORD?.trim();

  if (!email || !name || !password) {
    console.error(
      "ERROR: Missing required environment variables: INITIAL_SUPER_ADMIN_EMAIL, INITIAL_SUPER_ADMIN_NAME, INITIAL_SUPER_ADMIN_PASSWORD"
    );
    process.exit(1);
  }

  // 1. Password security constraints
  if (password.length < 12) {
    console.error("ERROR: Password must be at least 12 characters long.");
    process.exit(1);
  }

  if (DISALLOWED_PASSWORDS.includes(password)) {
    console.error("ERROR: Password matches a known vulnerable or placeholder password. Please choose a strong unique password.");
    process.exit(1);
  }

  // 2. Check if an active Super Admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: "SUPER_ADMIN",
      isActive: true,
      status: "ACTIVE",
    },
  });

  if (existingSuperAdmin) {
    console.warn(`NOTICE: An active Super Admin already exists in the system (${existingSuperAdmin.email}).`);
    console.log("Bootstrap aborted to prevent duplicate privilege escalation.");
    process.exit(0);
  }

  console.log(`Creating Super Admin user for: ${email}...`);

  // 3. Create or synchronize via Supabase Auth Admin if available
  let authUserId: string | null = null;
  try {
    const supabaseAdmin = createAdminClient();
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "SUPER_ADMIN" },
    });

    if (authUser?.user) {
      authUserId = authUser.user.id;
      console.log("✓ Supabase Auth user identity provisioned.");
    } else if (authError) {
      console.warn("Notice on Supabase Auth:", authError.message);
    }
  } catch (err: any) {
    console.warn("Supabase Auth API notice:", err.message);
  }

  // 4. Create or update Prisma User record
  const passwordHash = hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      isActive: true,
      isInternalStaff: true,
      passwordHash,
    },
    create: {
      id: authUserId || undefined,
      email,
      name,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      isActive: true,
      isInternalStaff: true,
      passwordHash,
    },
  });

  // 5. Assign SUPER_ADMIN role relation
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: superAdminRole.id,
        assignedBy: "SYSTEM_BOOTSTRAP",
      },
    });
  }

  // 6. Record immutable Audit Log
  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      actorEmail: email,
      actorRoleSnapshot: "SUPER_ADMIN",
      action: "SUPER_ADMIN_BOOTSTRAPPED",
      resourceType: "USER",
      resourceId: user.id,
      outcome: "SUCCESS",
      reason: "Initial server-side Super Admin provisioned",
    },
  });

  console.log("✓ Super Admin initialized successfully!");
  console.log("✓ Audit log record permanently registered.");
  console.log("IMPORTANT: Remember to clear INITIAL_SUPER_ADMIN_* variables from your environment after use.");
}

bootstrapSuperAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Bootstrap execution failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
