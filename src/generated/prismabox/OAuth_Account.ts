import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const OAuth_AccountPlain = t.Object(
  { providerId: t.String(), providerUserId: t.String(), userId: t.String() },
  { additionalProperties: false },
);

export const OAuth_AccountRelations = t.Object(
  {
    user: t.Object(
      {
        id: t.String(),
        firstname: t.String(),
        lastname: t.String(),
        username: t.String(),
        email: t.String(),
        emailVerified: t.Boolean(),
        phone: __nullable__(t.String()),
        roles: t.Array(
          t.Union(
            [
              t.Literal("GUEST"),
              t.Literal("SUPPORT"),
              t.Literal("SUPERVISOR"),
              t.Literal("ADMIN"),
            ],
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        hashedPassword: t.String(),
        isActive: t.Boolean(),
        isComment: __nullable__(t.String()),
        createdAt: t.Date(),
        updatedAt: t.Date(),
        profileId: __nullable__(t.String()),
        prefs: __nullable__(t.Any()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const OAuth_AccountPlainInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const OAuth_AccountPlainInputUpdate = t.Object(
  {},
  { additionalProperties: false },
);

export const OAuth_AccountRelationsInputCreate = t.Object(
  {
    user: t.Object(
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

export const OAuth_AccountRelationsInputUpdate = t.Partial(
  t.Object(
    {
      user: t.Object(
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

export const OAuth_AccountWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          providerId: t.String(),
          providerUserId: t.String(),
          userId: t.String(),
        },
        { additionalProperties: false },
      ),
    { $id: "OAuth_Account" },
  ),
);

export const OAuth_AccountWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              providerId: t.String(),
              providerUserId: t.String(),
              userId: t.String(),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ providerId: t.String() }),
            t.Object({ providerUserId: t.String() }),
            t.Object({ userId: t.String() }),
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
              providerId: t.String(),
              providerUserId: t.String(),
              userId: t.String(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "OAuth_Account" },
);

export const OAuth_AccountSelect = t.Partial(
  t.Object(
    {
      providerId: t.Boolean(),
      providerUserId: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const OAuth_AccountInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const OAuth_AccountOrderBy = t.Partial(
  t.Object(
    {
      providerId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      providerUserId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const OAuth_Account = t.Composite(
  [OAuth_AccountPlain, OAuth_AccountRelations],
  { additionalProperties: false },
);

export const OAuth_AccountInputCreate = t.Composite(
  [OAuth_AccountPlainInputCreate, OAuth_AccountRelationsInputCreate],
  { additionalProperties: false },
);

export const OAuth_AccountInputUpdate = t.Composite(
  [OAuth_AccountPlainInputUpdate, OAuth_AccountRelationsInputUpdate],
  { additionalProperties: false },
);
