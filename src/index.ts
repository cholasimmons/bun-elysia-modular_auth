import { Elysia, error } from "elysia";

// Configurations
import consts from "~config/consts";

// Plugins
import { swagger } from "@elysiajs/swagger";
import { rateLimit } from "elysia-rate-limit";
import cron from "@elysiajs/cron";
import cors from "@elysiajs/cors";
import { helmet } from "elysia-helmet";
import cookie from "@elysiajs/cookie";

// Middleware
import { bootLogger, gracefulShutdown, requestLogger } from "~utils/systemLogger";
import { ErrorMessages } from "~utils/errorMessages";
import { checkMaintenanceMode } from "~middleware/lifecycleHandlers";
import customResponse from "~middleware/customResponse";
import { sessionDerive } from "~middleware/session.derive";

// Route Handler
import { registerControllers } from "./server";
import { logger } from "@bogeychan/elysia-logger";
import jwt from "@elysiajs/jwt";
import { lucia } from "~config/lucia";


try {
  if (import.meta.main) {
    const PORT = Bun.env.PORT || 3000;
    const app = new Elysia({
      name: consts.server.name,
      prefix: `/v${consts.api.version}`,
      websocket: { idleTimeout: consts.websocket.timeout },
      // detail: { description: `${consts.server.name} Server API` }
    })

    // State
    .state('maintenanceMode', false)
    .state('timezone', Bun.env.TZ)

    /* Extensions */

    // Log errors
    // .use(logger({ 
    //   level: 'error',
    //   // file: "./my.log", // fileLogger
    // }))

    // Swagger
    .use(swagger({ autoDarkMode: true, documentation: {
      info: {
          title: `${consts.server.name}`,
          version: `${consts.server.version}`,
          description: `Server API for ${consts.server.name}`
      }
    }}))

    // CORS security
    .use(cors({
      // origin: ['http://localhost', 'http://localhost:5173'],
      methods: ['OPTIONS', 'GET', 'PUT', 'POST', 'DELETE'],
      credentials: true,
      origin: /localhost.*/,
      // origin: (ctx) => ctx.headers.get('Origin'),
      allowedHeaders: ['Content-Type', 'Authorization', 'Credentials', 'Origin', 'Host', 'os', 'ipCountry', 'X-Requested-With', 'X-Custom-Header', 'requestIP', 'Authentication-Method']
    }))

    // Helmet security (might conflict with swagger)
    .use(helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": ["'self'", "https://cdn.jsdelivr.net/"],
        },
      }
    }))

    // Cookie global handler
    .use(cookie({ secure: Bun.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'strict'}))

    // JWT
    .use(
      jwt({
          name: 'authJWT',
          secret: Bun.env.JWSCRT!,
          exp: `${consts.auth.jwtMaxAge}d`
      })
  )
  
    // Rate limiter for added security
    .use(rateLimit({max: Bun.env.NODE_ENV === 'production' ? 5 : 15}))

    // CRON soul manager
    .use(cron({
      name: 'midnight-daily',
      pattern: '0 0 * * *',
      // '*/1 * * * 1-6', // seconds (optional), minute, hour, day of the month, month, day of the week (RTL)
      timezone: Bun.env.TZ || 'Africa/Lusaka',
      startAt: '',
      stopAt: '',
      maxRuns: undefined,
      run() {
        console.log('[CRON] 24 hour mark')

        lucia.deleteExpiredSessions().then(() => {
          console.log('All expired sessions successfully deleted');
        }).catch(e => {
          console.error("Couldn't delete sessions. ",e);
        });
      }
    }))


    // Life cycles
    .derive(sessionDerive)
    .onBeforeHandle([checkMaintenanceMode]) // Checks if server is in maintenance mode
    .onError(({ code, error, set }:any) => ErrorMessages(code, error, set)) // General Error catching system
    .onStop(gracefulShutdown)
    .onRequest(requestLogger)
    .mapResponse(customResponse);

    // ROUTES
    registerControllers(app as any);

    process.on('SIGINT', app.stop);
    process.on('SIGTERM', app.stop);

    // initialize server
    app.listen(PORT, bootLogger);
  }
} catch (e) {
  console.log('Error firing up the server');
  console.error(e);
}