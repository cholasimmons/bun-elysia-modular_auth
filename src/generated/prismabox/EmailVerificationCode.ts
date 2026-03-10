import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const EmailVerificationCodePlain = t.Object(
  {
    id: t.Integer(),
    code: t.String(),
    userId: t.String(),
    email: t.String(),
    expiresAt: t.Date(),
  },
  { additionalProperties: false },
);

export const EmailVerificationCodeRelations = t.Object(
  {},
  { additionalProperties: false },
);

export const EmailVerificationCodePlainInputCreate = t.Object(
  { code: t.String(), email: t.String(), expiresAt: t.Date() },
  { additionalProperties: false },
);

export const EmailVerificationCodePlainInputUpdate = t.Object(
  {
    code: t.Optional(t.String()),
    email: t.Optional(t.String()),
    expiresAt: t.Optional(t.Date()),
  },
  { additionalProperties: false },
);

export const EmailVerificationCodeRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const EmailVerificationCodeRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const EmailVerificationCodeWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          code: t.String(),
          userId: t.String(),
          email: t.String(),
          expiresAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "EmailVerificationCode" },
  ),
);

export const EmailVerificationCodeWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), userId: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.Integer() }), t.Object({ userId: t.String() })],
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.Integer(),
              code: t.String(),
              userId: t.String(),
              email: t.String(),
              expiresAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "EmailVerificationCode" },
);

export const EmailVerificationCodeSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      code: t.Boolean(),
      userId: t.Boolean(),
      email: t.Boolean(),
      expiresAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const EmailVerificationCodeInclude = t.Partial(
  t.Object({ _count: t.Boolean() }, { additionalProperties: false }),
);

export const EmailVerificationCodeOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      code: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      expiresAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const EmailVerificationCode = t.Composite(
  [EmailVerificationCodePlain, EmailVerificationCodeRelations],
  { additionalProperties: false },
);

export const EmailVerificationCodeInputCreate = t.Composite(
  [
    EmailVerificationCodePlainInputCreate,
    EmailVerificationCodeRelationsInputCreate,
  ],
  { additionalProperties: false },
);

export const EmailVerificationCodeInputUpdate = t.Composite(
  [
    EmailVerificationCodePlainInputUpdate,
    EmailVerificationCodeRelationsInputUpdate,
  ],
  { additionalProperties: false },
);
