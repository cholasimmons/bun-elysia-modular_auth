import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Prisma, PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
export const adapter = new PrismaAdapter(db.session, db.user);

export interface SearchOptions{
    page?: number;
    limit?: number;
    sortBy?: { field: string; order?: 'asc' | 'desc' };
    search?: { field: string; value: string };
    include?: Record<string, boolean | { select?: Record<string, boolean>; }>;
}
export const prismaSearch = async<T extends keyof PrismaClient>(model: T, options: SearchOptions) => {
    const { sortBy, limit = 25, page = 1, search, include } = options;
  
    // Calculate the offset and limit
    const skip = limit * (page - 1);

    
    // Create the where clause if there's a search filter
    const where = (search?.field && search?.value) ? {
        [search.field]: {
            contains: search.value, // Adjust the filter based on your data type
            mode: 'insensitive', // Case-insensitive search
        }
    } : {};

    // Get the total count of records
    const total = await (db as any)[model].count({});

    // Get the paginated data
    const data = await (db as any)[model].findMany({
        skip,
        take: limit,
        include,
        orderBy: sortBy ? { [sortBy.field]: sortBy.order ?? 'asc' } : undefined,
        where
    });

    return {
        total, // Total number of records
        count: data.length, // Number of records returned
        page, // Current page number
        data // The actual paginated data
    };
}
// Built by Gemini