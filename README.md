# Elysia with Bun runtime

## Getting Started
To get started with this template, simply clone this repo and rename example_env to .env, paste this command into your terminal:
```bash
bun install
```

## Database Migration
To generate Prisma artifacts and migrate changes to the database, (you must have a running instance of PostgreSQL) [Laragon](https://laragon.org) is a quick and simple solution:
```bash
bunx prisma generate && bunx prisma migrate dev
```
Note: This schema is set to Windows by default, see `schema.prisma` file for possible changes


## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

Download the swagger OpenAPI json file from [Swagger](http://localhost:3000/swagger) and import it to
[Insomnia REST API Client](https://insomnia.rest) to prepare all endpoints for you to test.

