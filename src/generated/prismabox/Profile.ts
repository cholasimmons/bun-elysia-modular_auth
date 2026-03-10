import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ProfilePlain = t.Object(
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
);

export const ProfileRelations = t.Object(
  {
    user: __nullable__(
      t.Object(
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
    ),
    subscription: t.Object(
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
    wallet: __nullable__(
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
          isComment: __nullable__(t.String()),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    ),
    usedCoupons: t.Array(
      t.Object(
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
      ),
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const ProfilePlainInputCreate = t.Object(
  {
    bio: t.Optional(__nullable__(t.String())),
    documentType: t.Union([t.Literal("NRC"), t.Literal("PASSPORT")], {
      additionalProperties: false,
    }),
    photo: t.Optional(__nullable__(t.String())),
    gender: t.Optional(
      t.Union([t.Literal("MALE"), t.Literal("FEMALE"), t.Literal("OTHER")], {
        additionalProperties: false,
      }),
    ),
    firstname: t.String(),
    lastname: t.String(),
    email: t.String(),
    phone: t.Optional(__nullable__(t.String())),
    supportLevel: t.Optional(t.Integer()),
    subscriptionType: t.Union(
      [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
      { additionalProperties: false },
    ),
    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const ProfilePlainInputUpdate = t.Object(
  {
    bio: t.Optional(__nullable__(t.String())),
    documentType: t.Optional(
      t.Union([t.Literal("NRC"), t.Literal("PASSPORT")], {
        additionalProperties: false,
      }),
    ),
    photo: t.Optional(__nullable__(t.String())),
    gender: t.Optional(
      t.Union([t.Literal("MALE"), t.Literal("FEMALE"), t.Literal("OTHER")], {
        additionalProperties: false,
      }),
    ),
    firstname: t.Optional(t.String()),
    lastname: t.Optional(t.String()),
    email: t.Optional(t.String()),
    phone: t.Optional(__nullable__(t.String())),
    supportLevel: t.Optional(t.Integer()),
    subscriptionType: t.Optional(
      t.Union([t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")], {
        additionalProperties: false,
      }),
    ),
    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const ProfileRelationsInputCreate = t.Object(
  {
    user: t.Optional(
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
    subscription: t.Object(
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
    wallet: t.Optional(
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
    usedCoupons: t.Optional(
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

export const ProfileRelationsInputUpdate = t.Partial(
  t.Object(
    {
      user: t.Partial(
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
      subscription: t.Object(
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
      wallet: t.Partial(
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
      usedCoupons: t.Partial(
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

export const ProfileWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          bio: t.String(),
          userId: t.String(),
          documentId: t.String(),
          documentType: t.Union([t.Literal("NRC"), t.Literal("PASSPORT")], {
            additionalProperties: false,
          }),
          photo: t.String(),
          gender: t.Union(
            [t.Literal("MALE"), t.Literal("FEMALE"), t.Literal("OTHER")],
            { additionalProperties: false },
          ),
          firstname: t.String(),
          lastname: t.String(),
          email: t.String(),
          phone: t.String(),
          supportLevel: t.Integer(),
          subscriptionType: t.Union(
            [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
            { additionalProperties: false },
          ),
          isActive: t.Boolean(),
          isComment: t.String(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Profile" },
  ),
);

export const ProfileWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            {
              id: t.String(),
              userId: t.String(),
              email: t.String(),
              phone: t.String(),
            },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.String() }),
            t.Object({ userId: t.String() }),
            t.Object({ email: t.String() }),
            t.Object({ phone: t.String() }),
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
              bio: t.String(),
              userId: t.String(),
              documentId: t.String(),
              documentType: t.Union([t.Literal("NRC"), t.Literal("PASSPORT")], {
                additionalProperties: false,
              }),
              photo: t.String(),
              gender: t.Union(
                [t.Literal("MALE"), t.Literal("FEMALE"), t.Literal("OTHER")],
                { additionalProperties: false },
              ),
              firstname: t.String(),
              lastname: t.String(),
              email: t.String(),
              phone: t.String(),
              supportLevel: t.Integer(),
              subscriptionType: t.Union(
                [t.Literal("FREE"), t.Literal("PREMIUM"), t.Literal("ELITE")],
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
  { $id: "Profile" },
);

export const ProfileSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      bio: t.Boolean(),
      userId: t.Boolean(),
      user: t.Boolean(),
      documentId: t.Boolean(),
      documentType: t.Boolean(),
      photo: t.Boolean(),
      gender: t.Boolean(),
      firstname: t.Boolean(),
      lastname: t.Boolean(),
      email: t.Boolean(),
      phone: t.Boolean(),
      supportLevel: t.Boolean(),
      subscriptionType: t.Boolean(),
      subscription: t.Boolean(),
      wallet: t.Boolean(),
      usedCoupons: t.Boolean(),
      isActive: t.Boolean(),
      isComment: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ProfileInclude = t.Partial(
  t.Object(
    {
      user: t.Boolean(),
      documentType: t.Boolean(),
      gender: t.Boolean(),
      subscriptionType: t.Boolean(),
      subscription: t.Boolean(),
      wallet: t.Boolean(),
      usedCoupons: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ProfileOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      bio: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      documentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      photo: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      firstname: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      lastname: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      phone: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      supportLevel: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const Profile = t.Composite([ProfilePlain, ProfileRelations], {
  additionalProperties: false,
});

export const ProfileInputCreate = t.Composite(
  [ProfilePlainInputCreate, ProfileRelationsInputCreate],
  { additionalProperties: false },
);

export const ProfileInputUpdate = t.Composite(
  [ProfilePlainInputUpdate, ProfileRelationsInputUpdate],
  { additionalProperties: false },
);
