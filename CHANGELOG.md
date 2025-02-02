# Changelog


## [0.4.5] - 03-02-2025

### Added

- More custom errors to handle S3 issues
- `prefs` Json field added to User schema, for user\'s preferences
- `modifyPrefs` function added to Users Service, to modify a user\'s preferences
- Added `redisKeys`, `redisDel`, `redisGetAll` and `redisExists` to the redisService
- New User service (`getCachedUser`) that checks for a User by ID in cache, then falls back to database, otherwise returns a `NotFoundError`
- Notifications Module & schema
- `ConnectionsManager` to handle all web socket connectivity (under Notifications Module)
- `onStart()` lifecycle hook, loads all websocket connection ID's from database to cache
- [Prometheus](https://prometheus.io/) and [Grafana](https://grafana.com/grafana/) to test metrics (including `prometheus.yml` in the root)
- [Loki](https://grafana.com/oss/loki/) for logging
- `@bogeychan/elysia-logger` returned to stream and print logs to [Loki](https://grafana.com/oss/loki/)
- `logs` directory to store log text file
- `RedisEvents` and `RedisKeys` added to constants.ts file to serve as global dictionary for key names
- `_queue` and `_events` folders created to house their respective services


### Changed

- `.env` file now has Access Key and Secret Key provision for MinIO
- BUCKET names modified to allow for a more "multi-tenancy" setup on MinIO
- Files module heavily modified to allow CRUD actions on S3 storage
- Files schema now accomodates metadata JSON type, and userProfileId changed to uploaderUserId
- Modified the way `server.ts` is loaded in the main `index.ts`, now using Elysia as a plugin, with "v1" prefix.
- `_subscriptions` folder changed again, to `_queues_` so as to not confuse it for User Subscriptions or WebSocketSubscriptions.
- Implemented singleton pattern for ConnectionsManager, NotificationService, UsersService, AuthService
- constants.ts renamed to `constants.ts` for easier understanding for new users
- Reworked the Job Queue system for better scalability and maintenance
- Queues Events and Cache now rely on global dictionaries RedisEvents & RedisKeys for unified key naming

### Updated

- Bun 1.2.2
- Prisma 6.3.0
- Minio docker image update to `RELEASE.2025-01-20T14-49-07Z`
- Postgres docker image, `17.2-bullseye`



## [0.4.4] - 18-01-2025

### Added

- BullMQ fast and robust queue system, replacing Redis Pub/Sub
- Global header check to ensure the correct "X-Client-Type" is applied

### Fixed

- 

### Changed

- `_events` folder is now `_subscriptions`, and houses the BullMQ Queue system and Redis Event system
- Event system (Redis Pub/Sub) kept for educational purposes but no longer implemented.
- `sanitizeUserObject()` now in UsersService - returns a full User object WITHOUT password


### Removed

- `sanitizeUserObject()` from AuthService replaced by function of same name in UsersService.

### Updated

- Bun 1.1.43
- Elysia, 1.2.10
- Prisma 6.2.1



## [0.4.3] - 31-12-2024

### Added

- Rate limiter and message duplicate check to message sending service
- Subscription changing service function

### Fixed

- 

### Changed

- MessageService is now a singleton service, so is Wallets and Coupons services
- 

### Updated

- Elysia, 1.2.8 (big deal "minor update", reduces system memory usage by over half)
- Swagger, 1.2.0 Still seems to have a bug preventing the UI from loading (1.0.5 remains the goto version)



## [0.4.2] - 25-12-2024

### Added

- Added Wallet, Coupons & Messaging modules (not yet production ready)
- Wallet module can be expanded to communicate with third-party wallet systems, currently this is only a "ledger"
- Coupons module allows discounts to be issued
- Messaging module sends messages/notifications to a User from the System or another User
- Refined Error handling with custom handlers in `_exceptions` folder
- Event listeners via Redis Message Queuing

### Fixed

- auth middleware returns `error()` object instead of a custom object, this allows the router responses to not throw errors anymore
- Elysia 1.1.27 fixes the `.onError()` hook to now properly handle global errors

### Changed

- `Authentication-Method` header changed to `X-Client-Type`

### Updated

- Elysia, 1.1.27


## [0.4.1] - 14-08-2024

### Added

- Added MinIO for file storage (service must be running to use, just like database service)
- included `mime` package and `files` module for file related endpoints
- included `sharp` image processing library for image manipulation, including overlaying of watermarks
- added `images{}` to the `config/constants.ts` file to manage image resolution and quality, fallbacks are hardcoded incase of missing values (also available in .env file)
- Included Redis cache for quicker retrieval of commonly used data
- deviceIdentity now part of login process and sessions
- Session now tracks deviceIdentity (hashed) and IP address of User
- `/provinces` route added to showcase data retrieval in Mobile App

### Changed

- "JWTNAME" from `.env` file removed, JWT token name now hardcoded into system
- cookie name and jwt name now hardcoded into system for consistency
- Login auth is based on `Authentication-Method` header, 'JWT' for mobile app, 'Cookie' for Browser
- `maintenanceMode` store now depends on environment variable for system availability, defaults to false

### Fixed

- Registering a new User now returns sanitized User object in "data" field of response
- JWT Users are now properly authCheckt

### Removed

- Problematic else clause in `authCheck` that caused the availability of an Authentication header to overthrow the authMethod



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