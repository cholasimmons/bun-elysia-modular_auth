import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const MessagePlain = t.Object(
  {
    id: t.String(),
    senderId: __nullable__(t.String()),
    recipientId: t.String(),
    title: t.String(),
    message: t.String(),
    priority: t.Union(
      [t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")],
      { additionalProperties: false },
    ),
    deliveryMethods: t.Array(
      t.Union(
        [
          t.Literal("INTERNAL"),
          t.Literal("NOTIFICATION"),
          t.Literal("EMAIL"),
          t.Literal("SMS"),
        ],
        { additionalProperties: false },
      ),
      { additionalProperties: false },
    ),
    isRead: t.Boolean(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
    isArchived: t.Boolean(),
    isActive: t.Boolean(),
  },
  { additionalProperties: false },
);

export const MessageRelations = t.Object({}, { additionalProperties: false });

export const MessagePlainInputCreate = t.Object(
  {
    title: t.String(),
    message: t.String(),
    priority: t.Optional(
      t.Union([t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")], {
        additionalProperties: false,
      }),
    ),
    deliveryMethods: t.Optional(
      t.Array(
        t.Union(
          [
            t.Literal("INTERNAL"),
            t.Literal("NOTIFICATION"),
            t.Literal("EMAIL"),
            t.Literal("SMS"),
          ],
          { additionalProperties: false },
        ),
        { additionalProperties: false },
      ),
    ),
    isRead: t.Optional(t.Boolean()),
    isArchived: t.Optional(t.Boolean()),
    isActive: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const MessagePlainInputUpdate = t.Object(
  {
    title: t.Optional(t.String()),
    message: t.Optional(t.String()),
    priority: t.Optional(
      t.Union([t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")], {
        additionalProperties: false,
      }),
    ),
    deliveryMethods: t.Optional(
      t.Array(
        t.Union(
          [
            t.Literal("INTERNAL"),
            t.Literal("NOTIFICATION"),
            t.Literal("EMAIL"),
            t.Literal("SMS"),
          ],
          { additionalProperties: false },
        ),
        { additionalProperties: false },
      ),
    ),
    isRead: t.Optional(t.Boolean()),
    isArchived: t.Optional(t.Boolean()),
    isActive: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const MessageRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const MessageRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const MessageWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          senderId: t.String(),
          recipientId: t.String(),
          title: t.String(),
          message: t.String(),
          priority: t.Union(
            [t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")],
            { additionalProperties: false },
          ),
          deliveryMethods: t.Array(
            t.Union(
              [
                t.Literal("INTERNAL"),
                t.Literal("NOTIFICATION"),
                t.Literal("EMAIL"),
                t.Literal("SMS"),
              ],
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
          isRead: t.Boolean(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
          isArchived: t.Boolean(),
          isActive: t.Boolean(),
        },
        { additionalProperties: false },
      ),
    { $id: "Message" },
  ),
);

export const MessageWhereUnique = t.Recursive(
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
              senderId: t.String(),
              recipientId: t.String(),
              title: t.String(),
              message: t.String(),
              priority: t.Union(
                [t.Literal("LOW"), t.Literal("MEDIUM"), t.Literal("HIGH")],
                { additionalProperties: false },
              ),
              deliveryMethods: t.Array(
                t.Union(
                  [
                    t.Literal("INTERNAL"),
                    t.Literal("NOTIFICATION"),
                    t.Literal("EMAIL"),
                    t.Literal("SMS"),
                  ],
                  { additionalProperties: false },
                ),
                { additionalProperties: false },
              ),
              isRead: t.Boolean(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
              isArchived: t.Boolean(),
              isActive: t.Boolean(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Message" },
);

export const MessageSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      senderId: t.Boolean(),
      recipientId: t.Boolean(),
      title: t.Boolean(),
      message: t.Boolean(),
      priority: t.Boolean(),
      deliveryMethods: t.Boolean(),
      isRead: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      isArchived: t.Boolean(),
      isActive: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const MessageInclude = t.Partial(
  t.Object(
    {
      priority: t.Boolean(),
      deliveryMethods: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const MessageOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      senderId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      recipientId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      title: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      message: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isRead: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isArchived: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isActive: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Message = t.Composite([MessagePlain, MessageRelations], {
  additionalProperties: false,
});

export const MessageInputCreate = t.Composite(
  [MessagePlainInputCreate, MessageRelationsInputCreate],
  { additionalProperties: false },
);

export const MessageInputUpdate = t.Composite(
  [MessagePlainInputUpdate, MessageRelationsInputUpdate],
  { additionalProperties: false },
);
