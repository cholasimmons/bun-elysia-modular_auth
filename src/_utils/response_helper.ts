export const swaggerDetails = (title: string, description?: string) => {
    return {summary: title.toWellFormed(), description: description }
}