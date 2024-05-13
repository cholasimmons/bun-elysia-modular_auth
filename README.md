# Modular Elysia JS app | Authentication template (Bun runtime)

### Features
- Lucia Auth v3
- Prisma ORM (PostgreSQL integration)
- Schema Validation examples
- Helmet, CORS for added security
- Swagger documentation
- CRON with predefined 24 hour cycle
- basic endpoint logging
- authentication/authorization middleware (public/private routes based on roles)
- email verification codes
- change/reset password
- modular design for easy expansion



## Getting Started
To get started with this template, simply clone this repo, cd into the cloned folder and rename example_env to .env, paste this command into your terminal (in the cloned directory):
```bash
bun install
```

## Database Migration
To generate Prisma artifacts and migrate changes to the database, (you must have a running instance of PostgreSQL) [Laragon](https://laragon.org) is a quick and simple solution:
```bash
bunx prisma generate && bunx prisma migrate deploy
```

# Note:
As of May 2024 there exists a Prisma issue with generating the schema from within a docker image. A temporal fix requires some manual work.
1. Set `schema.prisma` binaryTarget to debian-openssl-1.1.x for Linux
2. Generate the schema on your local computer
3. Manually copy the folders `node_modules/.prisma` and `node_modules/@prisma` to the root directory
4. RUN a script from the Dockerfile to copy those 2 folders over into the image.
5. Manually initialize the database with the `migration.sql` file found in `prisma/migrations/`


## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/v1 with your browser or REST API Client to see the result.

Download the swagger OpenAPI json file from [Swagger](http://localhost:3000/v1/swagger) and import it to
[Insomnia REST API Client](https://insomnia.rest) to prepare all endpoints for you to test.


## Authenticating a User
The endpoint `/auth/register` allows you to create a new user account, while `/auth/login` logs you in.
This auth system uses cookies and JWT's.
The cookie name along with other configuration settings can be set in the typescript file  `_config/consts.ts`


# Docker
## Build docker image
From the root directory, run this code (Note: you need to have [Docker]('https://docker.io') installed and running):
```bash
docker build --pull -t bun-hello-world .
```
The `-t` flag lets us specify a name for the image, and `--pull` tells Docker to automatically download the latest version of the base image (oven/bun). The initial build will take longer, as Docker will download all the base images and dependencies.

## Run docker container
You can now run the image by running this code:
```bash
docker run -d -p 3000:3000 --name bun-app bun-hello-world
```

The `docker run` command starts a new container using the "bun-hello-world" image. It will be run in detached mode thanks to the `-d` argument, we'll map the container's port 3000 to our local machine's port 3000 (-p 3000:3000).

Visit [localhost:3000/v1]('http://localhost:3000/v1') You should see a "Hello World" welcome message.

To stop the container, we'll use docker stop <container-id>. If you can't find the container ID, you can use `docker ps` to list all running containers.