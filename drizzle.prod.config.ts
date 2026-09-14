import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.migrate.production", quiet: true });

const connectionString = process.env.PRODUCTION_DIRECT_DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error(
    "PRODUCTION_DIRECT_DATABASE_URL is required for production migrations.",
  );
}

let databaseUrl: URL;

try {
  databaseUrl = new URL(connectionString);
} catch {
  throw new Error("PRODUCTION_DIRECT_DATABASE_URL must be a valid PostgreSQL URL.");
}

if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
  throw new Error("PRODUCTION_DIRECT_DATABASE_URL must use PostgreSQL.");
}

if (databaseUrl.hostname.includes("-pooler")) {
  throw new Error("Production migrations require a direct URL, not a pooler URL.");
}

if (databaseUrl.pathname.length <= 1) {
  throw new Error("PRODUCTION_DIRECT_DATABASE_URL must name a database.");
}

console.info(
  `Production migration target: ${databaseUrl.hostname}/${databaseUrl.pathname.slice(1)}`,
);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
