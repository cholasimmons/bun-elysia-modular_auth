# Changelog


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