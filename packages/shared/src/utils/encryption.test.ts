import { test } from "node:test";
import * as assert from "node:assert";
import { encryptField, decryptField, isEncrypted, generateEncryptionKey } from "./encryption";

test("Encryption & Decryption Suite", async (t) => {
  const testKey = generateEncryptionKey();
  const plaintext = "SuperSecretAccountPassword123!";

  await t.test("should successfully encrypt a string", () => {
    const encrypted = encryptField(plaintext, testKey);
    assert.ok(encrypted);
    assert.notEquals(encrypted, plaintext);
    assert.ok(isEncrypted(encrypted));
  });

  await t.test("should successfully decrypt an encrypted string back to plaintext", () => {
    const encrypted = encryptField(plaintext, testKey);
    const decrypted = decryptField(encrypted, testKey);
    assert.strictEqual(decrypted, plaintext);
  });

  await t.test("should throw an error if decryption key is incorrect", () => {
    const encrypted = encryptField(plaintext, testKey);
    const wrongKey = generateEncryptionKey();
    assert.throws(() => {
      decryptField(encrypted, wrongKey);
    });
  });

  await t.test("should throw an error if format is invalid", () => {
    const invalidCipher = "invalid:format";
    assert.throws(() => {
      decryptField(invalidCipher, testKey);
    });
  });
});
