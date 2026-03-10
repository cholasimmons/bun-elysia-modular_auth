import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const WalletPlain = t.Object(
  {
    id: t.String(),
    userProfileId: t.String(),
    balance: t.Number(),
    currency: t.Union(
      [t.Literal("ZMW"), t.Literal("USD"), t.Literal("GBP"), t.Literal("ZAR")],
      { additionalProperties: false },
    ),
    isActive: t.Boolean(),
    isComment: __nullable__(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const WalletRelations = t.Object(
  {
    transactions: t.Array(
      t.Object(
        {
          id: t.String(),
          amount: t.Number(),
          discount: t.Number(),
          discountCode: __nullable__(t.String()),
          transactionFee: t.Number(),
          reference: __nullable__(t.String()),
          payerProfileId: t.String(),
          payeeProfileId: t.String(),
          currency: t.Union(
            [
              t.Literal("ZMW"),
              t.Literal("USD"),
              t.Literal("GBP"),
              t.Literal("ZAR"),
            ],
            { additionalProperties: false },
          ),
          status: t.Union(
            [t.Literal("PENDING"), t.Literal("SUCCESS"), t.Literal("FAILED")],
            { additionalProperties: false },
          ),
          longitude: __nullable__(t.Number()),
          latitude: __nullable__(t.Number()),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    userProfile: t.Object(
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
  },
  { additionalProperties: false },
);

export const WalletPlainInputCreate = t.Object(
  {
    balance: t.Optional(t.Number()),
    currency: t.Optional(
      t.Union(
        [
          t.Literal("ZMW"),
          t.Literal("USD"),
          t.Literal("GBP"),
          t.Literal("ZAR"),
        ],
        { additionalProperties: false },
      ),
    ),
    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const WalletPlainInputUpdate = t.Object(
  {
    balance: t.Optional(t.Number()),
    currency: t.Optional(
      t.Union(
        [
          t.Literal("ZMW"),
          t.Literal("USD"),
          t.Literal("GBP"),
          t.Literal("ZAR"),
        ],
        { additionalProperties: false },
      ),
    ),
    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const WalletRelationsInputCreate = t.Object(
  {
    transactions: t.Optional(
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
    userProfile: t.Object(
      {
        connect: t.Object(
          {
            id: t.String({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const WalletRelationsInputUpdate = t.Partial(
  t.Object(
    {
      transactions: t.Partial(
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
      userProfile: t.Object(
        {
          connect: t.Object(
            {
              id: t.String({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    { additionalProperties: false },
  ),
);

export const WalletWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          userProfileId: t.String(),
          balance: t.Number(),
          currency: t.Union(
            [
              t.Literal("ZMW"),
              t.Literal("USD"),
              t.Literal("GBP"),
              t.Literal("ZAR"),
            ],
            { additionalProperties: false },
          ),
          isActive: t.Boolean(),
          isComment: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Wallet" },
  ),
);

export const WalletWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.String(), userProfileId: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ userProfileId: t.String() }),
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
              userProfileId: t.String(),
              balance: t.Number(),
              currency: t.Union(
                [
                  t.Literal("ZMW"),
                  t.Literal("USD"),
                  t.Literal("GBP"),
                  t.Literal("ZAR"),
                ],
                { additionalProperties: false },
              ),
              isActive: t.Boolean(),
              isComment: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Wallet" },
);

export const WalletSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      userProfileId: t.Boolean(),
      balance: t.Boolean(),
      currency: t.Boolean(),
      isActive: t.Boolean(),
      isComment: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      transactions: t.Boolean(),
      userProfile: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const WalletInclude = t.Partial(
  t.Object(
    {
      currency: t.Boolean(),
      transactions: t.Boolean(),
      userProfile: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const WalletOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userProfileId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      balance: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isActive: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isComment: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Wallet = t.Composite([WalletPlain, WalletRelations], {
  additionalProperties: false,
});

export const WalletInputCreate = t.Composite(
  [WalletPlainInputCreate, WalletRelationsInputCreate],
  { additionalProperties: false },
);

export const WalletInputUpdate = t.Composite(
  [WalletPlainInputUpdate, WalletRelationsInputUpdate],
  { additionalProperties: false },
);
