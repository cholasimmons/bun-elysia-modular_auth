import { t } from "elysia";

export const paginationOptions:any = {
  page: t.Optional( t.Number() ),
  limit: t.Optional( t.Number({default: 25}) ),
  sortBy: t.Optional( t.String({  }) ),
  sortOrder: t.Optional( t.String({ default: 'asc' }) ),
  searchField: t.Optional( t.String({ description:'database column to search' }) ),
  search: t.Optional( t.String({ description: 'Keyword to search for' }) ),
}