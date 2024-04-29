# Changelog


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