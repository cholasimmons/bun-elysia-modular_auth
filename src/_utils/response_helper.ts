import { t, TSchema } from "elysia";

export const swaggerDetails = (title: string, description?: string) => {
    return { summary: title.toWellFormed(), description: description }
}

const swaggerResponse = (data:TSchema|null, defaultMessage?:string) => {
    if(data) {
        return t.Object({ data: data, message: t.String({ default: defaultMessage ?? null }) })
    } else {
        return t.Object({ message: t.String({ default: defaultMessage ?? null }) })
    }
}
    