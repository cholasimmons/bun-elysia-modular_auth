# Changelog


## [0.4.0] - 31-07-2024

### Added

- OAuth2 provider `Github` and `Google` for testing purposes. endpoint `/v1/auth/login/github` and `google` respectively, (requires OAuth2 secrets in .env file)
- Arctic and Oslo packages added to assist with OAuth login by Lucia Auth v3
- New database table `OAuth_Account` for multiple OAuth login
- User database object now takes `username` string input which is always the user's email (for now)
- Registration screen for web browser (placeholder)
- Added `prismaSearch` to the prisma config file to handle pagination on user requests
- Added `paginationOptions` to the new `root.models.ts` file to assist with pagination and search queries
- Added Github Actions file to automatically build and push a linux/arm64 image to docker when a `git push` is performed on build branch

### Changed

- mapResponse life-cycle now handles images, html, css & js files correctly
- Changes to `schema.prisma` and `auth/login` to accomodate the OAuth2 providers
- Welcome screen and Login screen for browsers beautified
- testing Buffer functions over btoa() for base64 encoding/decoding
- DTO's no longer derive from `t.Object({})` but `{}`, as we need to "spread" them with the paginationOptions

### Fixed

- AuthService instantiation no longer throwing errors inside of parent Controllers. (changed controller functions to arrow functions)

### Updated

- Elysia, 1.1.4



## [0.3.0] - 21-07-2024

### Added

- `swaggerDetails()` utility function to make it easier to create "summary" and "description" entries for swagger

### Changed

- Dependency Injection method changed to allow for a more acceptable standard
- Dockerfile now uses `:slim` tag for latest slim version of Bun (lighter image)
- Optimized customResponse middleware to also check for undefined responses

### Updated

- Bun, v1.1.20
- Elysia, 1.1.2 (1.1.3 problematic)
- Swagger, 1.0.5 (1.1.0 problematic)
- Prisma 5.15.1 (5.17.0 problematic)
- `docker-compose.yml` and `Dockerfile` improved

### Removed

- OAuth2 implementation from AuthHandler, caused Docker build to crash (will be re-implemented in future)


## [0.2.4] - 06-07-2024

### Added

- "directives' fix from `elysia-helmet` package was returned as Helmet v.2.0.0 seems to be incompatible with Swagger again
- More recent SQL migration file



## [0.2.3] - 05-07-2024

### Added

- `Patterns` extension from `@elysiajs/cron` to easily set time intervals in CRON
- PrismaORM now allows for multi schema files (after v5.15.0). Name schema files accordingly and place them inside `./prisma/schema` folder e.g: `./prisma/schema/users.prisma`, also update your VScode Prisma extension. [Docs](prisma.io/blog/oranize-your-prisma-schema-with-multi-file-support)

### Changed

- Default Docker internal network renamed to "api_net" and now uses 172.10.0.*/16 IPv4 addresses
- System default timezone changed to "Europe/London" if TZ value not present in .env file. Note: for Lusaka you can use "Africa/Harare"
- Moved JWT name to env file as JWTNAME

### Fixed

- **DockerFile** better optimized for smaller Docker builds

### Removed

- "directives' fix from `elysia-helmet` package was fixed, no need for this anymore

### Upgraded

- Bun, v1.1.18
- Elysia, 1.0.27


## [0.2.2] - 19-06-2024

### Added

- `docker-compose.yaml` file for Docker/Docker Swarm

### Fixed

- **DockerFile** to now be able to build to Docker



## [0.2.1] - 19-05-2024

### Added

- `@elyisajs/static` and `@elysiajs/htmx` plugins to serve assets + dynamic html files
- `Logestic v1.1.1` for logging
- `elysia-ip v1.0.5` to retrieve client IP 

### Changed

- Changed logger from internal to third-party, `Logestic`
- Root endpoint now returns a basic HTML file

### Fixed

- **customResponse** function now accomodates returning a file as a response, used to return HTML

### Upgraded

- Bun, v1.1.8


# ---


## [0.2.0] - 13-05-2024

### Added

- JWT authentication for frontend client.
- Authentication checking middleware "checkAuth" added to replace previous cookie middleware "checkCookieAuth".
- Prisma seeding function for required initial data such as global settings, roles, subscription plans e.tc..
- Separate "check" middleware (checkEmailVerified) for unverified User Account

### Changed

- User Authentication now returns JWT token or Cookie - depending on request header "Authentication-Method".
- Naming convention for files changed to camelCase
- Response schema changed to t.Union() to accomodate middleware checks that prevent the return of a code 200 response

### Updated

- `elysia-rate-limit` updated to v3.2.2

### Fixed

- fixed return type for User Profiles from "profiles" to global standard "data", and changed query name from "user" to "account"


# ---------


## [0.1.2] - 29-04-2024

### Changed

- Added fixes to [Dockerfile](README.md#note) to work around the Prisma+Docker issues.

### Fixed

- docker-compose.yaml now has DATABASE_URL key, essential to database access


# ---------


## [0.1.1] - 28-04-2024

### Added

- Added Arctic package for OAuth
- `sanitizeUser()` service to clean User object and strip password
- Added .dockerignore file now that we have a docker file
- Added docker-compose.yaml file which includes PostgresDB and PGAdmin4 images

### Changed

- Renamed and edited Dockerfile to standard [Bun]('https://bun.sh) recommendation
- added "native" binaryTarget to Prisma Schema file to automatically detect host

### Deprecated

- N/A

### Removed

- Removed File service from Users service to slim down package
- Removed @grotto/logysia logging package to use @bogeychan/elysia-logger instead

### Fixed

- Added a small fix to helmet middleware, allowing swagger to work without issues as before.


# ---------


## [0.1.0] - 26-04-2024

### Added

- Swagger OpenAPI v1.0.4
- Lucia Auth v3.2.0 for user authentication using cookies (JWT also possible)
- Prisma ORM (v5.6.0) using PostgreSQL as database store
- Emailing authentication codes/links using [Resend](https://resend.com)
- Session derive to better manipulate currently logged in User's account
- Response Transform, for a customised response object

### Changed

- Open-sourced repo for Zambian Programmers + the world

### Deprecated

- N/A

### Removed

- N/A

### Fixed

- N/A