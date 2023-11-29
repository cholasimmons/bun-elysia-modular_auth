// lucia.ts
import { lucia } from "lucia";
import { elysia } from "lucia/middleware";
import { db } from "./prisma";
import { prisma } from "@lucia-auth/adapter-prisma";

// expect error (see next section)
export const auth = lucia({
    adapter: prisma(db),
	env: Bun.env.NODE_ENV === 'production' ? "PROD" : "DEV", // "PROD" if deployed to HTTPS
	middleware: elysia(),

	getUserAttributes: (databaseUser) => {
		return {
			username: databaseUser.username,
			email: databaseUser.email,
			hash: databaseUser.hash,
			salt: databaseUser.salt,
			emailVerified: databaseUser.email_verified
		}
	},
});

export type Auth = typeof auth;