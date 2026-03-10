import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const Currency = t.Union(
  [t.Literal("ZMW"), t.Literal("USD"), t.Literal("GBP"), t.Literal("ZAR")],
  { additionalProperties: false },
);
