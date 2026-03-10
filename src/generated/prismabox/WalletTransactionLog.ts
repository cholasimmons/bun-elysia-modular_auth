import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const WalletTransactionLogPlain = t.Object(
  {
    id: t.Integer(),
    payerId: t.String(),
    payerNames: t.String(),
    payerNationalId: t.String(),
    payerNationalIdType: t.String(),
    payeeId: t.String(),
    payeeNationalId: t.String(),
    payeeNationalIdType: t.String(),
    payeeNames: t.String(),
    amount: t.Number(),
    discount: t.Number(),
    discountCode: __nullable__(t.String()),
    transactionFee: t.Number(),
    currency: t.String(),
    status: t.String(),
    timestamp: t.Date(),
    longitude: __nullable__(t.Number()),
    latitude: __nullable__(t.Number()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const WalletTransactionLogRelations = t.Object(
  {},
  { additionalProperties: false },
);

export const WalletTransactionLogPlainInputCreate = t.Object(
  {
    payerNames: t.String(),
    payerNationalIdType: t.String(),
    payeeNationalIdType: t.String(),
    payeeNames: t.String(),
    amount: t.Number(),
    discount: t.Number(),
    discountCode: t.Optional(__nullable__(t.String())),
    transactionFee: t.Number(),
    currency: t.String(),
    status: t.String(),
    timestamp: t.Date(),
    longitude: t.Optional(__nullable__(t.Number())),
    latitude: t.Optional(__nullable__(t.Number())),
  },
  { additionalProperties: false },
);

export const WalletTransactionLogPlainInputUpdate = t.Object(
  {
    payerNames: t.Optional(t.String()),
    payerNationalIdType: t.Optional(t.String()),
    payeeNationalIdType: t.Optional(t.String()),
    payeeNames: t.Optional(t.String()),
    amount: t.Optional(t.Number()),
    discount: t.Optional(t.Number()),
    discountCode: t.Optional(__nullable__(t.String())),
    transactionFee: t.Optional(t.Number()),
    currency: t.Optional(t.String()),
    status: t.Optional(t.String()),
    timestamp: t.Optional(t.Date()),
    longitude: t.Optional(__nullable__(t.Number())),
    latitude: t.Optional(__nullable__(t.Number())),
  },
  { additionalProperties: false },
);

export const WalletTransactionLogRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const WalletTransactionLogRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const WalletTransactionLogWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          payerId: t.String(),
          payerNames: t.String(),
          payerNationalId: t.String(),
          payerNationalIdType: t.String(),
          payeeId: t.String(),
          payeeNationalId: t.String(),
          payeeNationalIdType: t.String(),
          payeeNames: t.String(),
          amount: t.Number(),
          discount: t.Number(),
          discountCode: t.String(),
          transactionFee: t.Number(),
          currency: t.String(),
          status: t.String(),
          timestamp: t.Date(),
          longitude: t.Number(),
          latitude: t.Number(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "WalletTransactionLog" },
  ),
);

export const WalletTransactionLogWhereUnique = t.Recursive(
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
              payerId: t.String(),
              payerNames: t.String(),
              payerNationalId: t.String(),
              payerNationalIdType: t.String(),
              payeeId: t.String(),
              payeeNationalId: t.String(),
              payeeNationalIdType: t.String(),
              payeeNames: t.String(),
              amount: t.Number(),
              discount: t.Number(),
              discountCode: t.String(),
              transactionFee: t.Number(),
              currency: t.String(),
              status: t.String(),
              timestamp: t.Date(),
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
  { $id: "WalletTransactionLog" },
);

export const WalletTransactionLogSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      payerId: t.Boolean(),
      payerNames: t.Boolean(),
      payerNationalId: t.Boolean(),
      payerNationalIdType: t.Boolean(),
      payeeId: t.Boolean(),
      payeeNationalId: t.Boolean(),
      payeeNationalIdType: t.Boolean(),
      payeeNames: t.Boolean(),
      amount: t.Boolean(),
      discount: t.Boolean(),
      discountCode: t.Boolean(),
      transactionFee: t.Boolean(),
      currency: t.Boolean(),
      status: t.Boolean(),
      timestamp: t.Boolean(),
      longitude: t.Boolean(),
      latitude: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const WalletTransactionLogInclude = t.Partial(
  t.Object({ _count: t.Boolean() }, { additionalProperties: false }),
);

export const WalletTransactionLogOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payerId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payerNames: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payerNationalId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payerNationalIdType: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payeeId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payeeNationalId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payeeNationalIdType: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      payeeNames: t.Union([t.Literal("asc"), t.Literal("desc")], {
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
      currency: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      status: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      timestamp: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const WalletTransactionLog = t.Composite(
  [WalletTransactionLogPlain, WalletTransactionLogRelations],
  { additionalProperties: false },
);

export const WalletTransactionLogInputCreate = t.Composite(
  [
    WalletTransactionLogPlainInputCreate,
    WalletTransactionLogRelationsInputCreate,
  ],
  { additionalProperties: false },
);

export const WalletTransactionLogInputUpdate = t.Composite(
  [
    WalletTransactionLogPlainInputUpdate,
    WalletTransactionLogRelationsInputUpdate,
  ],
  { additionalProperties: false },
);
