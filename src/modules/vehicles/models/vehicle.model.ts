import {t} from "elysia";

export interface IVehicle {
    id?: number;
    brand: string;
    model?: string;
    year?: number;
    description?: string;
    links?: JSON;
    photo?: string[];
    color?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const VehicleDTO = t.Object({
    id: t.Number(),
    brand: t.String(),
    model: t.Nullable( t.String() ),
    year: t.Nullable( t.Number() ),
    description: t.Optional( t.String() ),
    links: t.Nullable(t.Object({})),
    photo: t.Optional(t.Array(t.String())),
    color: t.Optional(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Optional(t.Date()),
})
