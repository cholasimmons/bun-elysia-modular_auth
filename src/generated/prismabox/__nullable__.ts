import { t, type TSchema } from "elysia";
export const __nullable__ = <T extends TSchema>(schema: T) =>
  t.Union([t.Null(), schema]);
