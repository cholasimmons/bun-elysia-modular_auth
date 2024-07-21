# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:slim AS base
WORKDIR /usr/src/app


# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
COPY prisma /temp/dev/prisma
COPY tsconfig.json /temp/dev/
ENV NODE_ENV=development
# RUN apt-get update -y && apt-get install -y openssl build-essential libpq-dev
USER root
RUN cd /temp/dev && bun install
# --frozen-lockfile
# RUN mkdir -p /temp/dev/node_modules/@prisma && mkdir -p /temp/dev/node_modules/.prisma
RUN cd /temp/dev && bunx prisma generate

# install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json bun.lockb /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production


# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=install /temp/dev/package.json .
COPY --from=install /temp/dev/prisma prisma
COPY --from=install /temp/dev/tsconfig.json .
COPY public public
COPY src src

# [optional] tests & build
# ENV NODE_ENV=production
# RUN bun test
# RUN bun run build


# copy production dependencies and source code into final image
# FROM base AS release
# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=install /temp/dev/node_modules node_modules
# COPY --from=prerelease /usr/src/app/ .
# COPY --from=prerelease /usr/src/app/package.json .

# run the app
USER bun
EXPOSE 3000/tcp

CMD [ "bun", "dev" ]

# execute the binary!
# CMD ["/usr/src/app/app"]