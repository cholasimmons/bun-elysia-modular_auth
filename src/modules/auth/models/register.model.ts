import { Elysia, t } from "elysia";

export const  RegisterDTO = t.Object({
    username: t.String(),
    email: t.String(),
    password: t.String()
})

export interface IRegister {
    username: string;
    email: string;
    password: string;
}