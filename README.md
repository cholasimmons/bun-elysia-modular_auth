# Modular Elysia JS app | Authentication template (Bun runtime)

## [Test It Here](https://hello.simmons.studio/api/v1)

### [Awesome REST Client](https://insomnia.rest/download)
#### [Android Mobile API Tester](https://play.google.com/store/apps/details?id=apitester.org&hl=en)

### Features
- Lucia Auth v3 (including device identification for session management)
- Prisma ORM (PostgreSQL integration)
- Schema Validation examples
- Helmet, CORS for added security
- Swagger documentation
- CRON with predefined 24 hour cycle
- basic endpoint logging
- global error logging & handling
- authentication/authorization middleware (public/private routes based on user roles)
- email verification system
- change/reset password
- custom response model
- modular design for easy expansion
- Data Access Layer methodology
- S3 File Storage service
- In-memory cache for rapid data retrieval
- Event queuing



## Getting Started
To get started with this template, simply clone this repo, cd into the cloned folder, rename _env to .env, paste this command into your terminal (in the cloned directory):
```bash
bun install
```

## Database Migration
To generate Prisma artifacts and migrate your latest database changes to the database, (you must have a running instance of PostgreSQL) [Laragon](https://laragon.org) is a quick and simple solution:
```bash
bunx prisma generate && bunx prisma migrate deploy
```


## Development
Ensure the system configuration file `src/_config/consts.ts` is to your liking. It includes configurations that are referenced across your entire app such as server name, API version, cookieName e.tc...

To start the development server run:
```bash
bun run dev
```

Open http://localhost:3000/v1 with your browser or REST API Client to see the result.

Download the swagger OpenAPI json file from [Swagger](http://localhost:3000/v1/swagger) and import it to your
[REST API Client](https://insomnia.rest) to prepare all endpoints for you to test.


## Authenticating a User
The endpoint `/auth/register` allows you to create a new user account, while `/auth/login` logs you in.
This auth system uses cookies and JWT's.
The cookie name along with other configuration settings can be set in the typescript file `src/_config/consts.ts`.

### **Client Headers**
The headers sent from your client must specify `X-Client-Type` with either `JWT` or `Cookie`


# App Expansion
## Modules
To expand this application's functionality, add your modularized folder to `src/_modules/`.
The convention here is to name your module folder using the same name as your endpoint prefix for example `auth`, `users` or `products`.
Within your module folder include these files:
- `<module-name>-handler.ts`: "router" file with all possible endpoints, including ElysiaJS configuration for this specific module such as `prefix:` which determines the endpoint for this module.
- `<module-name>-controller.ts`: functions for the different endpoints in this module
- `<module-name>-service.ts`: service functions specific to this module that can be called from other modules
- `<module-name>-models.ts`: DTO (Data-To-Object) data models and schema files
- `index.ts`: root folder that references every file of this module

Once copied over, include the new module into Elysia by referencing the handlers class in `src/server.ts` file. i.e: `.use(productsHandler)`

# Docker
## Note:
As of May 2024 there exists a Prisma issue with generating the schema from within a docker image. A temporal fix requires some manual work.
1. Set `schema.prisma` binaryTarget to debian-openssl-1.1.x for Linux
2. Generate the schema on your local computer
3. Manually copy the folders `node_modules/.prisma` and `node_modules/@prisma` to the root directory
4. RUN a script from the Dockerfile to copy those 2 folders over into the image.
5. Manually initialize the database with the `migration.sql` file found in `prisma/migrations/`

## Build docker image
From the root directory, run this code (Note: you need to have [Docker]('https://docker.io') installed and running):
```bash
docker build --pull -t bun-hello-world .
```
The `-t` flag lets us specify a name for the image, and `--pull` tells Docker to automatically download the latest version of the base image (oven/bun). The initial build will take longer, as Docker will download all the base images and dependencies. The image will be based off the current OS you are building from. To build for a specific platform - Arm64 Linux for example, use the following:
```bash
docker buildx build --pull --platform linux/arm64 -t bun-hello-world .
```

## Run docker container
You can now run the image by running this code:
```bash
docker run -d -p 3000:3000 --name bun-app bun-hello-world
```

The `docker run` command starts a new container using the "bun-hello-world" image. It will be run in detached mode thanks to the `-d` argument, we'll map the container's port 3000 to our local machine's port 3000 (-p 3000:3000).

Visit [localhost:3000/v1]('http://localhost:3000/v1') You should see a "Hello World" welcome message.

To stop the container, we'll use docker stop <container-id>. If you can't find the container ID, you can use `docker ps` to list all running containers.

## Push docker container to registry
You can now push your newly built image to the cloud by running this code:
```bash
docker push <dockerhub-username>/bun-hello-world:slim

```
or to first change it's local tag name to the online one, type:
```bash
docker tag <local-image-name> <dockerhub-username>/bun-hello-world:slim

```