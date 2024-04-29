# Elysia with Bun runtime

## Getting Started
To get started with this template, simply clone this repo and rename example_env to .env, paste this command into your terminal:
```bash
bun install
```

## Database Migration
To generate Prisma artifacts and migrate changes to the database, (you must have a running instance of PostgreSQL) [Laragon](https://laragon.org) is a quick and simple solution:
```bash
bunx prisma generate && bunx prisma migrate dev init
```
Note: This schema is set to Windows by default, see `schema.prisma` file for possible changes


## Development
To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/v1 with your browser to see the result.

Download the swagger OpenAPI json file from [Swagger](http://localhost:3000/v1/swagger) and import it to
[Insomnia REST API Client](https://insomnia.rest) to prepare all endpoints for you to test.


## Authenticating a User
The endpoint `/auth/register` allows you to create a new user account, while `/auth/login` logs you in.
This auth system uses cookies, not JWT.
The cookie name along with other configuration settings can be set in `_config/consts.ts`


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