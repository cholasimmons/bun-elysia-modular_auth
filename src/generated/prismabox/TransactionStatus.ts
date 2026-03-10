import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const TransactionStatus = t.Union(
  [t.Literal("PENDING"), t.Literal("SUCCESS"), t.Literal("FAILED")],
  { additionalProperties: false },
);
