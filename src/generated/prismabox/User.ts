import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const UserPlain = t.Object(
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
);

export const UserRelations = t.Object(
  {
    profile: __nullable__(
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
    ),
    oauth: __nullable__(
      t.Object(
        {
          providerId: t.String(),
          providerUserId: t.String(),
          userId: t.String(),
        },
        { additionalProperties: false },
      ),
    ),
    authSession: t.Array(
      t.Object(
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
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const UserPlainInputCreate = t.Object(
  {
    firstname: t.String(),
    lastname: t.String(),
    username: t.String(),
    email: t.String(),
    emailVerified: t.Optional(t.Boolean()),
    phone: t.Optional(__nullable__(t.String())),
    roles: t.Optional(
      t.Array(
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
    ),
    hashedPassword: t.String(),
    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(__nullable__(t.String())),
    prefs: t.Optional(__nullable__(t.Any())),
  },
  { additionalProperties: false },
);

export const UserPlainInputUpdate = t.Object(
  {
    firstname: t.Optional(t.String()),
    lastname: t.Optional(t.String()),
    username: t.Optional(t.String()),
    email: t.Optional(t.String()),
    emailVerified: t.Optional(t.Boolean()),
    phone: t.Optional(__nullable__(t.String())),
    roles: t.Optional(
      t.Array(
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
    ),
    hashedPassword: t.Optional(t.String()),
    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(__nullable__(t.String())),
    prefs: t.Optional(__nullable__(t.Any())),
  },
  { additionalProperties: false },
);

export const UserRelationsInputCreate = t.Object(
  {
    profile: t.Optional(
      t.Object(
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
    ),
    oauth: t.Optional(
      t.Object(
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
    ),
    authSession: t.Optional(
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

export const UserRelationsInputUpdate = t.Partial(
  t.Object(
    {
      profile: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      oauth: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.String({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      authSession: t.Partial(
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

export const UserWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          firstname: t.String(),
          lastname: t.String(),
          username: t.String(),
          email: t.String(),
          emailVerified: t.Boolean(),
          phone: t.String(),
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
          isComment: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          profileId: t.String(),
          prefs: t.Any(),
        },
        { additionalProperties: false },
      ),
    { $id: "User" },
  ),
);

export const UserWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              username: t.String(),
              email: t.String(),
              phone: t.String(),
              profileId: t.String(),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ username: t.String() }),
            t.Object({ email: t.String() }),
            t.Object({ phone: t.String() }),
            t.Object({ profileId: t.String() }),
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
              firstname: t.String(),
              lastname: t.String(),
              username: t.String(),
              email: t.String(),
              emailVerified: t.Boolean(),
              phone: t.String(),
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
              isComment: t.String(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              profileId: t.String(),
              prefs: t.Any(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "User" },
);

export const UserSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      firstname: t.Boolean(),
      lastname: t.Boolean(),
      username: t.Boolean(),
      email: t.Boolean(),
      emailVerified: t.Boolean(),
      phone: t.Boolean(),
      roles: t.Boolean(),
      hashedPassword: t.Boolean(),
      isActive: t.Boolean(),
      isComment: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      profile: t.Boolean(),
      profileId: t.Boolean(),
      oauth: t.Boolean(),
      authSession: t.Boolean(),
      prefs: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UserInclude = t.Partial(
  t.Object(
    {
      roles: t.Boolean(),
      profile: t.Boolean(),
      oauth: t.Boolean(),
      authSession: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UserOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      firstname: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastname: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      username: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      emailVerified: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      phone: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      hashedPassword: t.Union([t.Literal("asc"), t.Literal("desc")], {
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
      profileId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      prefs: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const User = t.Composite([UserPlain, UserRelations], {
  additionalProperties: false,
});

export const UserInputCreate = t.Composite(
  [UserPlainInputCreate, UserRelationsInputCreate],
  { additionalProperties: false },
);

export const UserInputUpdate = t.Composite(
  [UserPlainInputUpdate, UserRelationsInputUpdate],
  { additionalProperties: false },
);
