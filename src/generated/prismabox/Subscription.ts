import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SubscriptionPlain = t.Object(
  {
    id: t.String(),
    name: t.Union(
      [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
      { additionalProperties: false },
    ),
    price: t.Number(),
    features: t.Array(t.String(), { additionalProperties: false }),
  },
  { additionalProperties: false },
);

export const SubscriptionRelations = t.Object(
  {
    user: t.Array(
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

export const SubscriptionPlainInputCreate = t.Object(
  {
    name: t.Union(
      [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
      { additionalProperties: false },
    ),
    price: t.Number(),
    features: t.Array(t.String(), { additionalProperties: false }),
  },
  { additionalProperties: false },
);

export const SubscriptionPlainInputUpdate = t.Object(
  {
    name: t.Optional(
      t.Union([t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")], {
        additionalProperties: false,
      }),
    ),
    price: t.Optional(t.Number()),
    features: t.Optional(t.Array(t.String(), { additionalProperties: false })),
  },
  { additionalProperties: false },
);

export const SubscriptionRelationsInputCreate = t.Object(
  {
    user: t.Optional(
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

export const SubscriptionRelationsInputUpdate = t.Partial(
  t.Object(
    {
      user: t.Partial(
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

export const SubscriptionWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          name: t.Union(
            [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
            { additionalProperties: false },
          ),
          price: t.Number(),
          features: t.Array(t.String(), { additionalProperties: false }),
        },
        { additionalProperties: false },
      ),
    { $id: "Subscription" },
  ),
);

export const SubscriptionWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              name: t.Union(
                [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
                { additionalProperties: false },
              ),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({
              name: t.Union(
                [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
                { additionalProperties: false },
              ),
            }),
          ],
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
              name: t.Union(
                [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
                { additionalProperties: false },
              ),
              price: t.Number(),
              features: t.Array(t.String(), { additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Subscription" },
);

export const SubscriptionSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      name: t.Boolean(),
      price: t.Boolean(),
      features: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SubscriptionInclude = t.Partial(
  t.Object(
    { name: t.Boolean(), user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const SubscriptionOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      price: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      features: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Subscription = t.Composite(
  [SubscriptionPlain, SubscriptionRelations],
  { additionalProperties: false },
);

export const SubscriptionInputCreate = t.Composite(
  [SubscriptionPlainInputCreate, SubscriptionRelationsInputCreate],
  { additionalProperties: false },
);

export const SubscriptionInputUpdate = t.Composite(
  [SubscriptionPlainInputUpdate, SubscriptionRelationsInputUpdate],
  { additionalProperties: false },
);
