import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CouponLogPlain = t.Object(
  {
    id: t.Integer(),
    code: t.String(),
    name: t.String(),
    discount: t.Number(),
    discountType: t.String(),
    timestamp: t.Date(),
    expiresAt: t.Date(),
    timesUsed: t.Integer(),
    maxUses: t.Integer(),
    usedByProfileId: t.String(),
    usedByNames: t.String(),
    usedFor: t.String(),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const CouponLogRelations = t.Object({}, { additionalProperties: false });

export const CouponLogPlainInputCreate = t.Object(
  {
    code: t.String(),
    name: t.String(),
    discount: t.Number(),
    discountType: t.String(),
    timestamp: t.Date(),
    expiresAt: t.Date(),
    timesUsed: t.Integer(),
    maxUses: t.Integer(),
    usedByNames: t.String(),
    usedFor: t.String(),
  },
  { additionalProperties: false },
);

export const CouponLogPlainInputUpdate = t.Object(
  {
    code: t.Optional(t.String()),
    name: t.Optional(t.String()),
    discount: t.Optional(t.Number()),
    discountType: t.Optional(t.String()),
    timestamp: t.Optional(t.Date()),
    expiresAt: t.Optional(t.Date()),
    timesUsed: t.Optional(t.Integer()),
    maxUses: t.Optional(t.Integer()),
    usedByNames: t.Optional(t.String()),
    usedFor: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const CouponLogRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const CouponLogRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const CouponLogWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          code: t.String(),
          name: t.String(),
          discount: t.Number(),
          discountType: t.String(),
          timestamp: t.Date(),
          expiresAt: t.Date(),
          timesUsed: t.Integer(),
          maxUses: t.Integer(),
          usedByProfileId: t.String(),
          usedByNames: t.String(),
          usedFor: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "CouponLog" },
  ),
);

export const CouponLogWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.Integer() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.Integer() })], {
          additionalProperties: false,
        }),
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
              name: t.String(),
              discount: t.Number(),
              discountType: t.String(),
              timestamp: t.Date(),
              expiresAt: t.Date(),
              timesUsed: t.Integer(),
              maxUses: t.Integer(),
              usedByProfileId: t.String(),
              usedByNames: t.String(),
              usedFor: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "CouponLog" },
);

export const CouponLogSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      code: t.Boolean(),
      name: t.Boolean(),
      discount: t.Boolean(),
      discountType: t.Boolean(),
      timestamp: t.Boolean(),
      expiresAt: t.Boolean(),
      timesUsed: t.Boolean(),
      maxUses: t.Boolean(),
      usedByProfileId: t.Boolean(),
      usedByNames: t.Boolean(),
      usedFor: t.Boolean(),
      createdAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CouponLogInclude = t.Partial(
  t.Object({ _count: t.Boolean() }, { additionalProperties: false }),
);

export const CouponLogOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      code: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      name: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      discount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      discountType: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      timestamp: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      expiresAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      timesUsed: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      maxUses: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      usedByProfileId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      usedByNames: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      usedFor: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const CouponLog = t.Composite([CouponLogPlain, CouponLogRelations], {
  additionalProperties: false,
});

export const CouponLogInputCreate = t.Composite(
  [CouponLogPlainInputCreate, CouponLogRelationsInputCreate],
  { additionalProperties: false },
);

export const CouponLogInputUpdate = t.Composite(
  [CouponLogPlainInputUpdate, CouponLogRelationsInputUpdate],
  { additionalProperties: false },
);
