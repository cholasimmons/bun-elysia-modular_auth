import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const FileUploadPlain = t.Object(
  {
    id: t.String(),
    origName: t.String(),
    fileName: t.String(),
    fileType: __nullable__(t.String()),
    fileSize: t.Integer(),
    bucket: t.String(),
    key: t.String(),
    path: t.String(),
    uploaderUserId: t.String(),
    status: t.Union(
      [
        t.Literal("UPLOAD_FAILED"),
        t.Literal("UPLOADED"),
        t.Literal("MISSING_IN_STORAGE"),
        t.Literal("ORPHANED"),
      ],
      { additionalProperties: false },
    ),
    isPublic: t.Boolean(),
    metadata: __nullable__(t.Any()),
    tags: t.Array(t.String(), { additionalProperties: false }),
    hash: __nullable__(t.String()),
    comment: __nullable__(t.String()),
    isActive: t.Boolean(),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const FileUploadRelations = t.Object(
  {},
  { additionalProperties: false },
);

export const FileUploadPlainInputCreate = t.Object(
  {
    origName: t.String(),
    fileName: t.String(),
    fileType: t.Optional(__nullable__(t.String())),
    fileSize: t.Integer(),
    bucket: t.String(),
    key: t.String(),
    path: t.String(),
    status: t.Optional(
      t.Union(
        [
          t.Literal("UPLOAD_FAILED"),
          t.Literal("UPLOADED"),
          t.Literal("MISSING_IN_STORAGE"),
          t.Literal("ORPHANED"),
        ],
        { additionalProperties: false },
      ),
    ),
    isPublic: t.Optional(t.Boolean()),
    metadata: t.Optional(__nullable__(t.Any())),
    tags: t.Array(t.String(), { additionalProperties: false }),
    hash: t.Optional(__nullable__(t.String())),
    comment: t.Optional(__nullable__(t.String())),
    isActive: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const FileUploadPlainInputUpdate = t.Object(
  {
    origName: t.Optional(t.String()),
    fileName: t.Optional(t.String()),
    fileType: t.Optional(__nullable__(t.String())),
    fileSize: t.Optional(t.Integer()),
    bucket: t.Optional(t.String()),
    key: t.Optional(t.String()),
    path: t.Optional(t.String()),
    status: t.Optional(
      t.Union(
        [
          t.Literal("UPLOAD_FAILED"),
          t.Literal("UPLOADED"),
          t.Literal("MISSING_IN_STORAGE"),
          t.Literal("ORPHANED"),
        ],
        { additionalProperties: false },
      ),
    ),
    isPublic: t.Optional(t.Boolean()),
    metadata: t.Optional(__nullable__(t.Any())),
    tags: t.Optional(t.Array(t.String(), { additionalProperties: false })),
    hash: t.Optional(__nullable__(t.String())),
    comment: t.Optional(__nullable__(t.String())),
    isActive: t.Optional(t.Boolean()),
  },
  { additionalProperties: false },
);

export const FileUploadRelationsInputCreate = t.Object(
  {},
  { additionalProperties: false },
);

export const FileUploadRelationsInputUpdate = t.Partial(
  t.Object({}, { additionalProperties: false }),
);

export const FileUploadWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.String(),
          origName: t.String(),
          fileName: t.String(),
          fileType: t.String(),
          fileSize: t.Integer(),
          bucket: t.String(),
          key: t.String(),
          path: t.String(),
          uploaderUserId: t.String(),
          status: t.Union(
            [
              t.Literal("UPLOAD_FAILED"),
              t.Literal("UPLOADED"),
              t.Literal("MISSING_IN_STORAGE"),
              t.Literal("ORPHANED"),
            ],
            { additionalProperties: false },
          ),
          isPublic: t.Boolean(),
          metadata: t.Any(),
          tags: t.Array(t.String(), { additionalProperties: false }),
          hash: t.String(),
          comment: t.String(),
          isActive: t.Boolean(),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "FileUpload" },
  ),
);

export const FileUploadWhereUnique = t.Recursive(
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
              origName: t.String(),
              fileName: t.String(),
              fileType: t.String(),
              fileSize: t.Integer(),
              bucket: t.String(),
              key: t.String(),
              path: t.String(),
              uploaderUserId: t.String(),
              status: t.Union(
                [
                  t.Literal("UPLOAD_FAILED"),
                  t.Literal("UPLOADED"),
                  t.Literal("MISSING_IN_STORAGE"),
                  t.Literal("ORPHANED"),
                ],
                { additionalProperties: false },
              ),
              isPublic: t.Boolean(),
              metadata: t.Any(),
              tags: t.Array(t.String(), { additionalProperties: false }),
              hash: t.String(),
              comment: t.String(),
              isActive: t.Boolean(),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "FileUpload" },
);

export const FileUploadSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      origName: t.Boolean(),
      fileName: t.Boolean(),
      fileType: t.Boolean(),
      fileSize: t.Boolean(),
      bucket: t.Boolean(),
      key: t.Boolean(),
      path: t.Boolean(),
      uploaderUserId: t.Boolean(),
      status: t.Boolean(),
      isPublic: t.Boolean(),
      metadata: t.Boolean(),
      tags: t.Boolean(),
      hash: t.Boolean(),
      comment: t.Boolean(),
      isActive: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const FileUploadInclude = t.Partial(
  t.Object(
    { status: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const FileUploadOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      origName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      fileName: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      fileType: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      fileSize: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      bucket: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      key: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      path: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      uploaderUserId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isPublic: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      metadata: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      tags: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      hash: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      comment: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      isActive: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const FileUpload = t.Composite([FileUploadPlain, FileUploadRelations], {
  additionalProperties: false,
});

export const FileUploadInputCreate = t.Composite(
  [FileUploadPlainInputCreate, FileUploadRelationsInputCreate],
  { additionalProperties: false },
);

export const FileUploadInputUpdate = t.Composite(
  [FileUploadPlainInputUpdate, FileUploadRelationsInputUpdate],
  { additionalProperties: false },
);
