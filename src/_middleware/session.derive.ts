// src/middleware.ts
import { verifyRequestOrigin } from "oslo/request";
import { lucia } from "~config/lucia";

export const sessionDerive = async ({ request:{ headers, method }, cookie, elysia_jwt }:any) => {
    // console.debug("Method: ", method);
    // console.debug("Headers: ", headers);
    
    // Check if the Authentication-Method header is present
    const authMethod = headers.get('Authentication-Method');
    if (!authMethod) {
        // If the header is missing, return an error response
        return { user: null, session: null, authMethod };
    }

    if (authMethod === 'Cookie') {
        // CSRF check
		if (method !== "GET") {
			const originHeader = headers.get("Origin"); // e.g: http://localhost:3000
			// NOTE: You may need to use `X-Forwarded-Host` instead
			const hostHeader = headers.get("Host");
            
			if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
                return {
					user: null,
					session: null, authMethod
				};
			}
		}

        // use headers instead of Cookie API to prevent type coercion
        const cookieHeader = headers.get("Cookie");
        const sessionId = lucia.readSessionCookie(cookieHeader ?? "");
        if (!sessionId) {
            return {
                user: null,
                session: null, authMethod
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
    
        const tokenUser = await elysia_jwt.verify(token);
        
        if(!tokenUser){
            return { user: null, session: null, authMethod };
        }
        
        return { user:tokenUser, session:null, authMethod };
    }   
}
