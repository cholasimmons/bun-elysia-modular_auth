# Changelog


## [0.1.1] - 27-04-2024

### Added

- Added Arctic package for OAuth
- `sanitizeUser()` service to clean User object and strip password
- Added .dockerignore file now that we have a docker file

### Changed

- Disabled helmet middleware as it conflicts with Swagger
- Renamed and edited Dockerfile to standard [Bun]('https://bun.sh) recommendation

### Deprecated

- N/A

### Removed

- Removed File service from Users service to slim down package

### Fixed

- N/A


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