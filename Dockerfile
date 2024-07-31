# see all official Bun versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:slim AS base


# Set up application
WORKDIR /usr/src/app

# install dependencies into temp directory (cache and speed for future builds)
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
COPY prisma /temp/dev/prisma
COPY tsconfig.json /temp/dev/
ENV NODE_ENV=development
RUN cd /temp/dev && bun install --frozen-lockfile
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

# Switch to non-root user for added security
USER bun
EXPOSE 3000/tcp

# run the app
CMD [ "bun", "dev" ]

# execute the binary!
# CMD ["/usr/src/app/app"]