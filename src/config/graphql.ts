export const yogaDefs = {
    typeDefs: /* GraphQL */`
        type Query {
            hi: String
        }
    `,
    resolvers: {
        Query: {
            hi: () => 'Hello from Elysia'
        }
    }
}