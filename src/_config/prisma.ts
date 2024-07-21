import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Prisma, PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
export const adapter = new PrismaAdapter(db.session, db.user);

const dbname = Bun.env.DATABASE_NAME;
try {
    await db.$connect();
    const result = await db.$queryRaw(Prisma.sql`CREATE DATABASE IF NOT EXISTS ${dbname}`);

  } catch (err) {
    console.error('Error ensuring database exists:', err);
    
  } finally {
    await db.$disconnect();
  }
