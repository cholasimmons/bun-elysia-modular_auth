import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const FileStatus = t.Union(
  [
    t.Literal("UPLOAD_FAILED"),
    t.Literal("UPLOADED"),
    t.Literal("MISSING_IN_STORAGE"),
    t.Literal("ORPHANED"),
  ],
  { additionalProperties: false },
);
