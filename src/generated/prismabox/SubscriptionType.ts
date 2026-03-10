import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SubscriptionType = t.Union(
  [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
  { additionalProperties: false },
);
