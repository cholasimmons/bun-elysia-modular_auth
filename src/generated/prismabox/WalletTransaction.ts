import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const WalletTransactionPlain = t.Object(
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
      [t.Literal("ZMW"), t.Literal("USD"), t.Literal("GBP"), t.Literal("ZAR")],
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
);

export const WalletTransactionRelations = t.Object(
  {
    payerWallet: t.Object(
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
        isComment: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const WalletTransactionPlainInputCreate = t.Object(
  {
    amount: t.Number(),
    discount: t.Number(),
    discountCode: t.Optional(__nullable__(t.String())),
    transactionFee: t.Number(),
    reference: t.Optional(__nullable__(t.String())),
    currency: t.Union(
      [t.Literal("ZMW"), t.Literal("USD"), t.Literal("GBP"), t.Literal("ZAR")],
      { additionalProperties: false },
    ),
    status: t.Optional(
      t.Union(
        [t.Literal("PENDING"), t.Literal("SUCCESS"), t.Literal("FAILED")],
        { additionalProperties: false },
      ),
    ),
    longitude: t.Optional(__nullable__(t.Number())),
    latitude: t.Optional(__nullable__(t.Number())),
  },
  { additionalProperties: false },
);

export const WalletTransactionPlainInputUpdate = t.Object(
  {
    amount: t.Optional(t.Number()),
    discount: t.Optional(t.Number()),
    discountCode: t.Optional(__nullable__(t.String())),
    transactionFee: t.Optional(t.Number()),
    reference: t.Optional(__nullable__(t.String())),
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
    status: t.Optional(
      t.Union(
        [t.Literal("PENDING"), t.Literal("SUCCESS"), t.Literal("FAILED")],
        { additionalProperties: false },
      ),
    ),
    longitude: t.Optional(__nullable__(t.Number())),
    latitude: t.Optional(__nullable__(t.Number())),
  },
  { additionalProperties: false },
);

export const WalletTransactionRelationsInputCreate = t.Object(
  {
    payerWallet: t.Object(
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

export const WalletTransactionRelationsInputUpdate = t.Partial(
  t.Object(
    {
      payerWallet: t.Object(
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

export const WalletTransactionWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          amount: t.Number(),
          discount: t.Number(),
          discountCode: t.String(),
          transactionFee: t.Number(),
          reference: t.String(),
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
          longitude: t.Number(),
          latitude: t.Number(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "WalletTransaction" },
  ),
);

export const WalletTransactionWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.String() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.String() })], {
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
              id: t.String(),
              amount: t.Number(),
              discount: t.Number(),
              discountCode: t.String(),
              transactionFee: t.Number(),
              reference: t.String(),
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
                [
                  t.Literal("PENDING"),
                  t.Literal("SUCCESS"),
                  t.Literal("FAILED"),
                ],
                { additionalProperties: false },
              ),
              longitude: t.Number(),
              latitude: t.Number(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "WalletTransaction" },
);

export const WalletTransactionSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      amount: t.Boolean(),
      discount: t.Boolean(),
      discountCode: t.Boolean(),
      transactionFee: t.Boolean(),
      reference: t.Boolean(),
      payerProfileId: t.Boolean(),
      payeeProfileId: t.Boolean(),
      currency: t.Boolean(),
      status: t.Boolean(),
      longitude: t.Boolean(),
      latitude: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      payerWallet: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const WalletTransactionInclude = t.Partial(
  t.Object(
    {
      currency: t.Boolean(),
      status: t.Boolean(),
      payerWallet: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const WalletTransactionOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      amount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      discount: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      discountCode: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      transactionFee: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      reference: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payerProfileId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payeeProfileId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      longitude: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      latitude: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const WalletTransaction = t.Composite(
  [WalletTransactionPlain, WalletTransactionRelations],
  { additionalProperties: false },
);

export const WalletTransactionInputCreate = t.Composite(
  [WalletTransactionPlainInputCreate, WalletTransactionRelationsInputCreate],
  { additionalProperties: false },
);

export const WalletTransactionInputUpdate = t.Composite(
  [WalletTransactionPlainInputUpdate, WalletTransactionRelationsInputUpdate],
  { additionalProperties: false },
);
