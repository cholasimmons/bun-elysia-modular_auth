import { t } from "elysia";
export const __transformDate__ = (options?: Parameters<typeof t.String>[0]) =>
  t
    .Transform(t.String({ format: "date-time", ...options }))
    .Decode((value) => new Date(value))
    .Encode((value) => value.toISOString());
