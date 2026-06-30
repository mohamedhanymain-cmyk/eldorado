const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const rootDir = path.join(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const examplePath = path.join(rootDir, ".env.example");

console.log("⚙️  Starting Eldorado ERP environment setup...");

// 1. Copy .env.example if .env doesn't exist
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log("✅ Created .env file from template (.env.example)");
  } else {
    console.error("❌ Error: .env.example not found at root!");
    process.exit(1);
  }
} else {
  console.log("ℹ️  .env file already exists. Updating placeholders...");
}

// 2. Read current .env
let envContent = fs.readFileSync(envPath, "utf8");

// Helper to replace variable placeholder with generated value
function replacePlaceholder(key, value) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(envContent)) {
    // Check if it is default placeholder
    const line = envContent.match(regex)[0];
    if (
      line.includes("change-me") ||
      line.includes('""') ||
      line.includes("000000000")
    ) {
      envContent = envContent.replace(regex, `${key}="${value}"`);
      console.log(`🔑 Generated secure key for: ${key}`);
      return true;
    }
  }
  return false;
}

// 3. Generate secure tokens
const encryptionKey = crypto.randomBytes(32).toString("hex");
const jwtSecret = crypto.randomBytes(32).toString("hex");
const jwtRefreshSecret = crypto.randomBytes(32).toString("hex");

let updated = false;
updated = replacePlaceholder("ENCRYPTION_KEY", encryptionKey) || updated;
updated = replacePlaceholder("JWT_SECRET", jwtSecret) || updated;
updated = replacePlaceholder("JWT_REFRESH_SECRET", jwtRefreshSecret) || updated;

// 4. Save file
if (updated) {
  fs.writeFileSync(envPath, envContent, "utf8");
  console.log("🎉 .env file successfully configured with secure keys!");
} else {
  console.log("ℹ️  All secure keys are already configured.");
}
