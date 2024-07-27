// lucia.ts
import { Lucia, TimeSpan } from "lucia";
import { adapter } from "./prisma";
import { Apple, Facebook, GitHub, Google, MicrosoftEntraId, Spotify, Twitter } from "arctic";
import { Role } from "@prisma/client";
import consts from "./consts";


export const lucia = new Lucia(adapter, {
    sessionCookie: {
        name: consts.auth.name,
        expires: true, // session cookies have very long lifespan (2 years)
        attributes: {
            secure: Bun.env.NODE_ENV === "production",
            sameSite: "strict",
			// domain: "" // Bun.env.HOST
        }
    },
    sessionExpiresIn: new TimeSpan(1, "w"),
    getSessionAttributes: (attributes) => {
		return {
			ipCountry: attributes.ipCountry ?? 'Unknown',
			os: attributes.os ?? 'Unknown',
			host: attributes.host ?? 'Unknown',
			userAgentHash: attributes.userAgentHash,
			fresh: attributes.fresh,
            activeExpires: attributes.activeExpires,
            expiresAt: attributes.expiresAt
		};
	},
    getUserAttributes: (attributes) => {
        return {
            email: attributes.email,
            emailVerified: attributes.emailVerified,
            roles: attributes.roles,
            isActive: attributes.isActive,
            firstname: attributes.firstname,
            lastname: attributes.lastname,
            profileId: attributes.profileId,
        }
    },
    // getOAuthAttributes: (attributes) => {
    //     return {
    //         userId: attributes.userId,
    //         providerId: attributes.providerId,
    //         providerUserId: attributes.providerUserId,
    //     }
    // }
});

// IMPORTANT
declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        userId: string;
        DatabaseSessionAttributes: DatabaseSessionAttributes;
        DatabaseUserAttributes: DatabaseUserAttributes;
        DatabaseOAuthAttributes: DatabaseOAuthAttributes;
    }
    interface DatabaseSessionAttributes {
		ipCountry: string|null;
        os: string|null,
        host: string|null,
        userAgentHash: string|null,
        activeExpires: number,
        fresh: boolean,
        expiresAt: Date
	}

    interface DatabaseUserAttributes {
        email: string;
        emailVerified: boolean;
        roles: Role[];
        isActive: boolean;
        firstname: string;
        lastname: string;
        profileId: string|null;
    }

    interface DatabaseOAuthAttributes {
        userId: string;
        providerId: string;
        providerUserId: number;
    }
}



export const googleAuth = new Google(
    Bun.env.GOOGLE_CLIENT_ID ?? '',
    Bun.env.GOOGLE_CLIENT_SECRET ?? '',
    "/v1/auth/login/google/callback"
)

export const apple = new Apple(
    { clientId: Bun.env.ACLIENTID ?? '', teamId: 'string', keyId: Bun.env.ACLIENT_SECRET ?? '', certificate: 'string' },
    "/login/apple/callback"
)

export const microsoft = new MicrosoftEntraId(
    'microsoft',
    Bun.env.MSCLIENTID ?? '',
    Bun.env.MSCLIENT_SECRET ?? '',
    "/login/microsoft/callback"
)

export const githubAuth = new GitHub(Bun.env.GH_BASIC_CLIENT_ID ?? '',
    Bun.env.GH_BASIC_SECRET_ID ?? '', {});

export const facebook = new Facebook(
    Bun.env.FBCLIENTID ?? '',
    Bun.env.FBCLIENT_SECRET ?? '',
    "/login/facebook/callback"
)

export const twitter = new Twitter(
    Bun.env.XCLIENTID ?? '',
    Bun.env.XCLIENT_SECRET ?? '',
    "/login/x/callback"
)