import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const WSConnectionsPlain = t.Object(
  {
    id: t.Integer(),
    userId: t.String(),
    connectionId: t.String(),
    createdAt: t.Date(),
    updatedAt: __nullable__(t.Date()),
  },
  { additionalProperties: false },
);

export const WSConnectionsRelations = t.Object(
  {},
  { additionalProperties: false },
);

export const WSConnectionsPlainInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const WSConnectionsPlainInputUpdate = t.Object(
  {},
  { additionalProperties: false },
);

export const WSConnectionsRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const WSConnectionsRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const WSConnectionsWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          userId: t.String(),
          connectionId: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "WSConnections" },
  ),
);

export const WSConnectionsWhereUnique = t.Recursive(
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
              userId: t.String(),
              connectionId: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "WSConnections" },
);

export const WSConnectionsSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      userId: t.Boolean(),
      connectionId: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const WSConnectionsInclude = t.Partial(
  t.Object({ _count: t.Boolean() }, { additionalProperties: false }),
);

export const WSConnectionsOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      connectionId: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const WSConnections = t.Composite(
  [WSConnectionsPlain, WSConnectionsRelations],
  { additionalProperties: false },
);

export const WSConnectionsInputCreate = t.Composite(
  [WSConnectionsPlainInputCreate, WSConnectionsRelationsInputCreate],
  { additionalProperties: false },
);

export const WSConnectionsInputUpdate = t.Composite(
  [WSConnectionsPlainInputUpdate, WSConnectionsRelationsInputUpdate],
  { additionalProperties: false },
);
