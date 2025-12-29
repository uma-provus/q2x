import { db } from "./index";
import { tenants, users } from "./schema";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(users);
  await db.delete(tenants);

  // Create a specific tenant and user for testing
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: "Acme Corp",
      slug: "acme",
    })
    .returning();

  const passwordHash = await bcrypt.hash("password123", 10);

  await db.insert(users).values({
    tenantId: tenant.id,
    email: "admin@acme.com",
    name: "Admin User",
    passwordHash,
    status: "active",
  });

  console.log("Seeding complete!");
  console.log("Test User:");
  console.log("Email: admin@acme.com");
  console.log("Password: password123");

  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
