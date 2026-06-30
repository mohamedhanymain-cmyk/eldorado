import { test } from "node:test";
import * as assert from "node:assert";
import { AccountsService } from "./accounts.service";
import { PrismaService } from "../../common/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

// Setup mock config service
const mockConfigService = {
  get: (key: string, defaultValue?: string) => {
    if (key === "ENCRYPTION_KEY") {
      // Return 32-byte hex key
      return "0000000000000000000000000000000000000000000000000000000000000000";
    }
    return defaultValue;
  },
} as unknown as ConfigService;

test("AccountsService - Optimistic Locking & Encryption Tests", async (t) => {
  await t.test("should encrypt password before creating account and decrypt when reading", async () => {
    let rawInputData: any = null;

    // Mock prisma client create operation
    const mockPrismaService = {
      account: {
        create: async (args: { data: any }) => {
          rawInputData = args.data;
          return {
            ...args.data,
            id: "mock-uuid",
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        },
      },
    } as unknown as PrismaService;

    const service = new AccountsService(mockPrismaService, mockConfigService);

    const result = await service.create({
      platform: "Steam",
      category: "Gaming",
      email: "test@example.com",
      password: "MySuperSecretPassword",
      purchasePrice: 10,
      expectedSalePrice: 20,
    });

    // Check that raw database entry is encrypted
    assert.ok(rawInputData.password.includes(":"));
    assert.notStrictEqual(rawInputData.password, "MySuperSecretPassword");

    // Check that returned DTO is decrypted
    assert.strictEqual(result.password, "MySuperSecretPassword");
  });

  await t.test("should succeed update if matching version is supplied", async () => {
    let updateWhere: any = null;
    let updateData: any = null;

    const mockPrismaService = {
      account: {
        findUnique: async () => ({ status: "AVAILABLE" }),
        update: async (args: { where: any; data: any }) => {
          updateWhere = args.where;
          updateData = args.data;
          return {
            id: args.where.id,
            internalId: "ELD-MOCK",
            platform: "Steam",
            category: "Gaming",
            email: "test@example.com",
            password: "encrypted-password",
            purchasePrice: 10,
            expectedSalePrice: 20,
            status: "RESERVED",
            version: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        },
      },
    } as unknown as PrismaService;

    const service = new AccountsService(mockPrismaService, mockConfigService);

    const result = await service.update("mock-uuid", {
      status: "RESERVED",
      version: 1, // Correct current version
    });

    assert.strictEqual(updateWhere.id, "mock-uuid");
    assert.strictEqual(updateWhere.version, 1);
    assert.strictEqual(result.version, 2);
  });

  await t.test("should throw ConflictException if prisma update fails due to mismatched version", async () => {
    const mockPrismaService = {
      account: {
        findUnique: async () => ({ status: "AVAILABLE" }),
        update: async () => {
          // Simulate prisma record not found error (P2025)
          const error = new Error("Record to update not found.");
          (error as any).code = "P2025";
          throw error;
        },
      },
    } as unknown as PrismaService;

    const service = new AccountsService(mockPrismaService, mockConfigService);

    await assert.rejects(
      async () => {
        await service.update("mock-uuid", {
          status: "RESERVED",
          version: 99, // Wrong version triggers P2025 error
        });
      },
      (err: any) => {
        return err.status === 409 && err.message.includes("Conflict");
      }
    );
  });
});
