import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const DiscountType = t.Union(
  [t.Literal("FLAT"), t.Literal("PERCENTAGE")],
  { additionalProperties: false },
);
