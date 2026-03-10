import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const AutoEnrolPlain = t.Object(
  {
    id: t.Integer(),
    names: __nullable__(t.String()),
    email: t.String(),
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
    supportLevel: t.Integer(),
    isActive: t.Boolean(),
    isComment: __nullable__(t.String()),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const AutoEnrolRelations = t.Object({}, { additionalProperties: false });

export const AutoEnrolPlainInputCreate = t.Object(
  {
    names: t.Optional(__nullable__(t.String())),
    email: t.String(),
    phone: t.Optional(__nullable__(t.String())),
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
    supportLevel: t.Optional(t.Integer()),
    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AutoEnrolPlainInputUpdate = t.Object(
  {
    names: t.Optional(__nullable__(t.String())),
    email: t.Optional(t.String()),
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
    supportLevel: t.Optional(t.Integer()),
    isActive: t.Optional(t.Boolean()),
    isComment: t.Optional(__nullable__(t.String())),
  },
  { additionalProperties: false },
);

export const AutoEnrolRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const AutoEnrolRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const AutoEnrolWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          names: t.String(),
          email: t.String(),
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
          supportLevel: t.Integer(),
          isActive: t.Boolean(),
          isComment: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "AutoEnrol" },
  ),
);

export const AutoEnrolWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), email: t.String(), phone: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.Integer() }),
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
              id: t.Integer(),
              names: t.String(),
              email: t.String(),
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
              supportLevel: t.Integer(),
              isActive: t.Boolean(),
              isComment: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "AutoEnrol" },
);

export const AutoEnrolSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      names: t.Boolean(),
      email: t.Boolean(),
      phone: t.Boolean(),
      roles: t.Boolean(),
      supportLevel: t.Boolean(),
      isActive: t.Boolean(),
      isComment: t.Boolean(),
      createdAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const AutoEnrolInclude = t.Partial(
  t.Object(
    { roles: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const AutoEnrolOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      names: t.Union([t.Literal("asc"), t.Literal("desc")], {
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
    },
    { additionalProperties: false },
  ),
);

export const AutoEnrol = t.Composite([AutoEnrolPlain, AutoEnrolRelations], {
  additionalProperties: false,
});

export const AutoEnrolInputCreate = t.Composite(
  [AutoEnrolPlainInputCreate, AutoEnrolRelationsInputCreate],
  { additionalProperties: false },
);

export const AutoEnrolInputUpdate = t.Composite(
  [AutoEnrolPlainInputUpdate, AutoEnrolRelationsInputUpdate],
  { additionalProperties: false },
);
