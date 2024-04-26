// src/middleware.ts
import { Elysia } from "elysia";
import { type User, type Session } from "lucia";
import { lucia } from "~config/lucia";

export const sessionDerive = async ({ request, cookie }:any) => {
    // use headers instead of Cookie API to prevent type coercion
    const cookieHeader = request.headers.get("Cookie") ?? "";
    
    const sessionId = lucia.readSessionCookie(cookieHeader);
    if (!sessionId) {
        return {
            user: null,
            session: null
        };
    }

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
        cookie[sessionCookie.name].set({
            value: sessionCookie.value,
            ...sessionCookie.attributes
        });
    }

    return { user: user, session: session };
}