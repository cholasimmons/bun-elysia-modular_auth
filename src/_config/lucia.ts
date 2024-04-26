// lucia.ts
import { Lucia, TimeSpan } from "lucia";
import { adapter, db } from "./prisma";
import { Apple, Facebook, GitHub, Google, MicrosoftEntraId, Spotify, Twitter } from "arctic";
import { Profile, Role } from "@prisma/client";
import { profile } from "bun:jsc";
import consts from "./consts";


export const lucia = new Lucia(adapter, {
    sessionCookie: {
        name: consts.server.cookieName,
        expires: true, // session cookies have very long lifespan (2 years)
        attributes: {
            secure: Bun.env.NODE_ENV === "production",
            sameSite: "strict",
			domain: Bun.env.HOST ?? 'localhost',
        }
    },
    sessionExpiresIn: new TimeSpan(1, "w"),
    getSessionAttributes: (attributes) => {
        // console.log("Session Attr: ",attributes);

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
        // console.log("User Attr: ",attributes);
        
        return {
            email: attributes.email,
            emailVerified: attributes.emailVerified,
            roles: attributes.roles,
            isActive: attributes.isActive,
            firstname: attributes.firstname,
            lastname: attributes.lastname,
            profileId: attributes.profileId,
        }
    }
});

// IMPORTANT
declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        userId: string;
        DatabaseSessionAttributes: DatabaseSessionAttributes;
        DatabaseUserAttributes: DatabaseUserAttributes;
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
}



export const google = new Google(
    Bun.env.GCLIENTID ?? '',
    Bun.env.GCLIENT_SECRET ?? '',
    "http://localhost:3000/login/google/callback"
)

export const apple = new Apple(
    { clientId: Bun.env.ACLIENTID ?? '', teamId: 'string', keyId: Bun.env.ACLIENT_SECRET ?? '', certificate: 'string' },
    "http://localhost:3000/login/apple/callback"
)

export const microsoft = new MicrosoftEntraId(
    'microsoft',
    Bun.env.MSCLIENTID ?? '',
    Bun.env.MSCLIENT_SECRET ?? '',
    "http://localhost:3000/login/microsoft/callback"
)

const github = new GitHub(
    Bun.env.GHCLIENTID ?? '',
    Bun.env.GHCLIENT_SECRET ?? '', { redirectURI: "http://localhost:3000/login/github/callback" }
)

export const facebook = new Facebook(
    Bun.env.FBCLIENTID ?? '',
    Bun.env.FBCLIENT_SECRET ?? '',
    "http://localhost:3000/login/facebook/callback"
)

export const twitter = new Twitter(
    Bun.env.XCLIENTID ?? '',
    Bun.env.XCLIENT_SECRET ?? '',
    "http://localhost:3000/login/x/callback"
)

// export const auth = lucia({
// 	env: Bun.env.NODE_ENV === 'development' ? "DEV" : "PROD", // "PROD" if deployed to HTTPS
//     adapter: prisma(db, {
// 		user: "user", // model User {}
// 		key: "key", // model Key {}
// 		session: "session", // model Session {}
// 		// profile: "profile" // model Profile {}
// 	}),
// 	sessionExpiresIn: {
// 		activePeriod: 1000 * 60 * 30, // 30 minutes
// 		idlePeriod: 1000 * 60 * 10, // 10 minutes
// 	},

//     getUserAttributes: (data: any) => {
// 		return {
// 			// email: data.email?.toLowerCase(),
// 			emailVerified: Boolean(data.emailVerified),
// 			roles: Array(...data.roles),
// 			// roleObjects: Array(data.roleObjects),
// 			// hashed_password: Number(data.hashed_password),
// 			isActive: Boolean(data.isActive),
// 			names: String(data.names),
// 			profileId: data.profileId ?? null
// 		};
// 	},

// 	getSessionAttributes: (data) => {
// 		return {
// 			// absoluteExpiration: data.absoluteExpiration
// 			// email: String(data.email),
// 			os: data.os ?? 'Unknown',
// 			host: data.host ?? null,
// 			userAgentHash: data.user_agent_hash as string,
// 			// countryCode: data.country_code as string,
// 			activePeriodExpiresAt: data.activePeriod,
// 			idlePeriodExpiresAt: data.idlePeriodExpiresAt,
// 			state: data.state,
// 			fresh: data.fresh,
// 		}
// 	},

// 	// optional
// 	csrfProtection: {
// 		allowedSubDomains: ["*"],
// 		// host?: string,
// 		// hostHeader?: string
// 	},

// 	sessionCookie: {
// 		// name:
// 		attributes: { sameSite: 'strict', secure: Bun.env.NODE_ENV === "production" }, 
// 		expires: true
// 	},

// 	// experimental
// 	experimental: {
// 		debugMode: true
// 	}
// });


// export type Auth = typeof auth;