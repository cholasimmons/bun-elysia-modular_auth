// src/middleware.ts
import { verifyRequestOrigin } from "oslo/request";
import { AuthenticationError, AuthorizationError, InternalServerError } from "src/_exceptions/custom_errors";
import { lucia } from "~config/lucia";

export const sessionDerive = async ({ request:{ headers, method }, cookie, jwt, locals }:any) => {
    // console.debug("Method: ", method);
    // console.debug("Locals: ", locals);
    // console.debug("Headers: ", headers);
    
    // Get new authentication-mode header
    const authMethod = headers.get('X-Client-Type');

    // Check if the authentication-mode header is present
    if (!authMethod) {
        // If the header is missing, return an error response
        return { user: null, session: null };
    }

    if (authMethod === "Cookie") {
        
        // CSRF check
		if (method !== "GET") {
			const originHeader = headers.get("Origin"); // e.g: http://localhost:3000
			// NOTE: You may need to use `X-Forwarded-Host` instead
			const hostHeader = headers.get("Host");

            if(!originHeader || !hostHeader){
                console.error("CSRF Check fail. Origin and Host headers required");
                throw new InternalServerError("CSRF Check iminent fail");
            }
            
			if (!verifyRequestOrigin(originHeader, [hostHeader])) {
                
                return {
					user: null,
					session: null,
                    authMethod
				};
			}
		}

        // use headers instead of Cookie API to prevent type coercion
        const cookieHeader = headers.get("Cookie") ?? "";
        const sessionId = lucia.readSessionCookie(cookieHeader);
        if (!sessionId) {
            return {
                user: null,
                session: null,
                authMethod: authMethod
            };
        }

        // const headers = new Headers();

        const { session, user } = await lucia.validateSession(sessionId);
        
        if (session && session.fresh) {
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookie[sessionCookie.name].set({
                value: sessionCookie.value,
                ...sessionCookie.attributes
            });
        }
        if (!session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            // headers.append("Set-Cookie", sessionCookie.serialize());
            cookie[sessionCookie.name].set({
                value: sessionCookie.value,
                ...sessionCookie.attributes
            });
        }
        

        return { user, session, authMethod };
    } else if (authMethod === 'JWT') {
        // Handle JWT-based authentication
        // Extract and validate JWT token from request headers or body
        // Set user information in request object if authentication is successful
  
        const token = headers?.get('Authorization')?.replace("Bearer ", "") ?? null;
        if(!token){
            return { user: null, session: null, authMethod };
        }
    
        const tokenUser = await jwt.verify(token);
        
        if(!tokenUser){
            return { user: null, session: null, authMethod };
        }
        
        return { user:tokenUser, session:null, authMethod };
    } else {
        // Fallback to User-Agent parsing
        const userAgent = headers.get('user-agent');
        if (/mobile|android|ios|flutter/i.test(userAgent)) {
            locals.isNativeApp = true;
        } else if (/mozilla|chrome|safari|firefox|edge/i.test(userAgent)) {
            locals.isBrowser = true;
        } else {
            locals.isUnknown = true;
            // If an unsupported authentication method is specified, return an error response
            return { user: null, session: null, authMethod };
        }
    }
}
