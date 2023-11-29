import { t } from "elysia";

export const  LoginDTO = t.Object({
    // names: t.Optional(t.String()),
    email: t.String(),
    password: t.String()
})

export interface ILogin {
    // names?: string;
    email: string;
    password: string;
}