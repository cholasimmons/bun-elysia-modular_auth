import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const SessionPlain = t.Object(
  {
    id: t.String(),
    userId: t.String(),
    fresh: t.Boolean(),
    expiresAt: t.Date(),
    activeExpires: t.Integer(),
    deviceIdentifier: t.String(),
    authType: __nullable__(t.String()),
    os: __nullable__(t.String()),
    ip: t.String(),
    ipCountry: __nullable__(t.String()),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const SessionRelations = t.Object(
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

export const SessionPlainInputCreate = t.Object(
  {
    fresh: t.Optional(t.Boolean()),
    expiresAt: t.Date(),
    activeExpires: t.Integer(),
    deviceIdentifier: t.String(),
    authType: t.Optional(__nullable__(t.String())),
    os: t.Optional(__nullable__(t.String())),
    ip: t.String(),
    ipCountry: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const SessionPlainInputUpdate = t.Object(
  {
    fresh: t.Optional(t.Boolean()),
    expiresAt: t.Optional(t.Date()),
    activeExpires: t.Optional(t.Integer()),
    deviceIdentifier: t.Optional(t.String()),
    authType: t.Optional(__nullable__(t.String())),
    os: t.Optional(__nullable__(t.String())),
    ip: t.Optional(t.String()),
    ipCountry: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const SessionRelationsInputCreate = t.Object(
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

export const SessionRelationsInputUpdate = t.Partial(
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

export const SessionWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          userId: t.String(),
          fresh: t.Boolean(),
          expiresAt: t.Date(),
          activeExpires: t.Integer(),
          deviceIdentifier: t.String(),
          authType: t.String(),
          os: t.String(),
          ip: t.String(),
          ipCountry: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Session" },
  ),
);

export const SessionWhereUnique = t.Recursive(
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
              userId: t.String(),
              fresh: t.Boolean(),
              expiresAt: t.Date(),
              activeExpires: t.Integer(),
              deviceIdentifier: t.String(),
              authType: t.String(),
              os: t.String(),
              ip: t.String(),
              ipCountry: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Session" },
);

export const SessionSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      userId: t.Boolean(),
      fresh: t.Boolean(),
      expiresAt: t.Boolean(),
      activeExpires: t.Boolean(),
      deviceIdentifier: t.Boolean(),
      authType: t.Boolean(),
      os: t.Boolean(),
      ip: t.Boolean(),
      ipCountry: t.Boolean(),
      createdAt: t.Boolean(),
      user: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const SessionInclude = t.Partial(
  t.Object(
    { user: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const SessionOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      fresh: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      expiresAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      activeExpires: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      deviceIdentifier: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      authType: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      os: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ip: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      ipCountry: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Session = t.Composite([SessionPlain, SessionRelations], {
  additionalProperties: false,
});

export const SessionInputCreate = t.Composite(
  [SessionPlainInputCreate, SessionRelationsInputCreate],
  { additionalProperties: false },
);

export const SessionInputUpdate = t.Composite(
  [SessionPlainInputUpdate, SessionRelationsInputUpdate],
  { additionalProperties: false },
);
