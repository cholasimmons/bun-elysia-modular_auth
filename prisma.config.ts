import "dotenv/config"; // Ensure environment variables are loaded
import type { PrismaConfig } from "prisma";
import { env } from "prisma/config";

export default {
  schema: "prisma", // Path to your Prisma schema file
  migrations: {
    path: "prisma/migrations", // Directory for migration files
    seed: "bunx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"), // Use the DATABASE_URL environment variable
  },
} satisfies PrismaConfig;
