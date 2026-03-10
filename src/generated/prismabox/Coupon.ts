import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const CouponPlain = t.Object(
  {
    id: t.String(),
    code: t.String(),
    name: t.String(),
    discount: t.Number(),
    discountType: t.Union([t.Literal("FLAT"), t.Literal("PERCENTAGE")], {
      additionalProperties: false,
    }),
    expiresAt: __nullable__(t.Date()),
    maxUses: t.Integer(),
    ownerProfileId: __nullable__(t.String()),
    isActive: t.Boolean(),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const CouponRelations = t.Object(
  {
    usedBy: t.Array(
      t.Object(
        {
          id: t.String(),
          bio: __nullable__(t.String()),
          userId: __nullable__(t.String()),
          documentId: t.String(),
          documentType: t.Union([t.Literal("NRC"), t.Literal("PASSPORT")], {
            additionalProperties: false,
          }),
          photo: __nullable__(t.String()),
          gender: t.Union(
            [t.Literal("MALE"), t.Literal("FEMALE"), t.Literal("OTHER")],
            { additionalProperties: false },
          ),
          firstname: t.String(),
          lastname: t.String(),
          email: t.String(),
          phone: __nullable__(t.String()),
          supportLevel: t.Integer(),
          subscriptionType: t.Union(
            [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
            { additionalProperties: false },
          ),
          isActive: t.Boolean(),
          isComment: __nullable__(t.String()),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const CouponPlainInputCreate = t.Object(
  {
    code: t.String(),
    name: t.String(),
    discount: t.Number(),
    discountType: t.Optional(
      t.Union([t.Literal("FLAT"), t.Literal("PERCENTAGE")], {
        additionalProperties: false,
      }),
    ),
    expiresAt: t.Optional(__nullable__(t.Date())),
    maxUses: t.Optional(t.Integer()),
    isActive: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const CouponPlainInputUpdate = t.Object(
  {
    code: t.Optional(t.String()),
    name: t.Optional(t.String()),
    discount: t.Optional(t.Number()),
    discountType: t.Optional(
      t.Union([t.Literal("FLAT"), t.Literal("PERCENTAGE")], {
        additionalProperties: false,
      }),
    ),
    expiresAt: t.Optional(__nullable__(t.Date())),
    maxUses: t.Optional(t.Integer()),
    isActive: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const CouponRelationsInputCreate = t.Object(
  {
    usedBy: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const CouponRelationsInputUpdate = t.Partial(
  t.Object(
    {
      usedBy: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.String({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const CouponWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          code: t.String(),
          name: t.String(),
          discount: t.Number(),
          discountType: t.Union([t.Literal("FLAT"), t.Literal("PERCENTAGE")], {
            additionalProperties: false,
          }),
          expiresAt: t.Date(),
          maxUses: t.Integer(),
          ownerProfileId: t.String(),
          isActive: t.Boolean(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Coupon" },
  ),
);

export const CouponWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), code: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.String() }), t.Object({ code: t.String() })],
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
              id: t.String(),
              code: t.String(),
              name: t.String(),
              discount: t.Number(),
              discountType: t.Union(
                [t.Literal("FLAT"), t.Literal("PERCENTAGE")],
                { additionalProperties: false },
              ),
              expiresAt: t.Date(),
              maxUses: t.Integer(),
              ownerProfileId: t.String(),
              isActive: t.Boolean(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Coupon" },
);

export const CouponSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      code: t.Boolean(),
      name: t.Boolean(),
      discount: t.Boolean(),
      discountType: t.Boolean(),
      expiresAt: t.Boolean(),
      maxUses: t.Boolean(),
      ownerProfileId: t.Boolean(),
      isActive: t.Boolean(),
      createdAt: t.Boolean(),
      usedBy: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const CouponInclude = t.Partial(
  t.Object(
    { discountType: t.Boolean(), usedBy: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const CouponOrderBy = t.Partial(
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
      expiresAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      maxUses: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ownerProfileId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isActive: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Coupon = t.Composite([CouponPlain, CouponRelations], {
  additionalProperties: false,
});

export const CouponInputCreate = t.Composite(
  [CouponPlainInputCreate, CouponRelationsInputCreate],
  { additionalProperties: false },
);

export const CouponInputUpdate = t.Composite(
  [CouponPlainInputUpdate, CouponRelationsInputUpdate],
  { additionalProperties: false },
);
