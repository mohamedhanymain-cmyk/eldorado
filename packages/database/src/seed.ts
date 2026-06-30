import { PrismaClient, RoleType, AccountStatus } from "@prisma/client";
import * as argon2 from "argon2";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// Simple AES-256-GCM encryption for seed data
function encrypt(text: string): string {
  // Use a deterministic key for seeding (matches .env.example default)
  const key = Buffer.from(
    process.env.ENCRYPTION_KEY ||
      "0000000000000000000000000000000000000000000000000000000000000000",
    "hex"
  );
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

function generateInternalId(index: number): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `ELD-${dateStr}-${suffix}${index}`;
}

async function main() {
  console.log("🌱 Seeding Eldorado ERP database...\n");

  // Clean existing data (order matters due to FK constraints)
  await prisma.activityLog.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.account.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const ownerPassword = await argon2.hash("Owner@2026!");
  const adminPassword = await argon2.hash("Admin@2026!");
  const staffPassword = await argon2.hash("Staff@2026!");

  const owner = await prisma.user.create({
    data: {
      email: "owner@eldorado.local",
      passwordHash: ownerPassword,
      role: RoleType.OWNER,
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@eldorado.local",
      passwordHash: adminPassword,
      role: RoleType.ADMINISTRATOR,
      isActive: true,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff@eldorado.local",
      passwordHash: staffPassword,
      role: RoleType.STAFF,
      isActive: true,
    },
  });

  console.log(`✅ Created ${3} users`);
  console.log(`   Owner: owner@eldorado.local / Owner@2026!`);
  console.log(`   Admin: admin@eldorado.local / Admin@2026!`);
  console.log(`   Staff: staff@eldorado.local / Staff@2026!\n`);

  // --- Suppliers ---
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "PremiumAccounts Co.",
      email: "sales@premiumaccounts.com",
      trustScore: 95,
      isBlacklisted: false,
      balance: 1250.0,
      notes: "Reliable supplier for gaming accounts. Fast delivery.",
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "DigitalVault Supply",
      email: "contact@digitalvault.io",
      trustScore: 78,
      isBlacklisted: false,
      balance: -340.5,
      notes: "Good prices, occasional delays on bulk orders.",
    },
  });

  const supplier3 = await prisma.supplier.create({
    data: {
      name: "ShadyDeals Ltd.",
      email: "noreply@shadydeals.xyz",
      trustScore: 15,
      isBlacklisted: true,
      balance: 0,
      notes: "BLACKLISTED — Multiple chargebacks and invalid accounts.",
    },
  });

  console.log(`✅ Created ${3} suppliers\n`);

  // --- Accounts ---
  const accounts = [
    {
      internalId: generateInternalId(1),
      platform: "Steam",
      category: "Gaming",
      email: "gamer1@example.com",
      password: encrypt("SteamPass123!"),
      recoveryEmail: "recovery1@example.com",
      recoveryPassword: encrypt("RecoveryPass1!"),
      username: "ProGamer_2026",
      twoFactorStatus: true,
      purchasePrice: 45.0,
      expectedSalePrice: 89.99,
      actualSalePrice: null,
      status: AccountStatus.AVAILABLE,
      supplierId: supplier1.id,
    },
    {
      internalId: generateInternalId(2),
      platform: "Epic Games",
      category: "Gaming",
      email: "epicfan@example.com",
      password: encrypt("EpicPass456!"),
      recoveryEmail: null,
      recoveryPassword: null,
      username: "EpicWarrior",
      twoFactorStatus: false,
      purchasePrice: 22.5,
      expectedSalePrice: 49.99,
      actualSalePrice: null,
      status: AccountStatus.PENDING_VERIFICATION,
      supplierId: supplier1.id,
    },
    {
      internalId: generateInternalId(3),
      platform: "Netflix",
      category: "Streaming",
      email: "stream_premium@example.com",
      password: encrypt("NetflixPrem789!"),
      recoveryEmail: "streamrecovery@example.com",
      recoveryPassword: encrypt("StreamRec789!"),
      username: null,
      twoFactorStatus: false,
      purchasePrice: 8.0,
      expectedSalePrice: 19.99,
      actualSalePrice: 17.99,
      status: AccountStatus.SOLD,
      supplierId: supplier2.id,
    },
    {
      internalId: generateInternalId(4),
      platform: "Spotify",
      category: "Streaming",
      email: "music_lover@example.com",
      password: encrypt("SpotifyLove321!"),
      recoveryEmail: null,
      recoveryPassword: null,
      username: "MusicLover321",
      twoFactorStatus: false,
      purchasePrice: 5.0,
      expectedSalePrice: 14.99,
      actualSalePrice: null,
      status: AccountStatus.RESERVED,
      supplierId: supplier2.id,
    },
    {
      internalId: generateInternalId(5),
      platform: "Origin",
      category: "Gaming",
      email: "eaplayer@example.com",
      password: encrypt("OriginPlay555!"),
      recoveryEmail: "eabackup@example.com",
      recoveryPassword: encrypt("EABackup555!"),
      username: "EA_Pro_Player",
      twoFactorStatus: true,
      purchasePrice: 60.0,
      expectedSalePrice: 129.99,
      actualSalePrice: null,
      status: AccountStatus.AVAILABLE,
      supplierId: supplier1.id,
    },
  ];

  for (const account of accounts) {
    await prisma.account.create({ data: account });
  }

  console.log(`✅ Created ${accounts.length} accounts\n`);

  // --- Activity Logs ---
  await prisma.activityLog.createMany({
    data: [
      {
        userId: owner.id,
        description: "System initialized and database seeded",
      },
      {
        userId: admin.id,
        description: "Admin account activated",
      },
      {
        userId: staff.id,
        description: "Staff account activated",
      },
    ],
  });

  console.log(`✅ Created activity log entries\n`);
  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
