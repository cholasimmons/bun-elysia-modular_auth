import { Elysia, error } from "elysia";

// Configurations
import consts from "~config/consts";
import { lucia } from "~config/lucia";

// Plugins
import { swagger } from "@elysiajs/swagger";
import { rateLimit } from "elysia-rate-limit";
import cron, { Patterns } from "@elysiajs/cron";
import cors from "@elysiajs/cors";
import { helmet } from "elysia-helmet";
import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { staticPlugin } from '@elysiajs/static';
import { htmx } from "elysia-htmx";

// Middleware
import { bootLogger, gracefulShutdown, requestLogger } from "~utils/systemLogger";
import { ErrorMessages } from "~utils/errorMessages";
import { checkMaintenanceMode } from "~middleware/lifecycleHandlers";
import customResponse from "~middleware/customResponse";
import { sessionDerive } from "~middleware/session.derive";

// Route Handler
import { registerControllers } from "./server";
import { logger } from "@bogeychan/elysia-logger";
import { ip } from "elysia-ip";
import { Logestic } from "logestic";


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
    .state('timezone', Bun.env.TZ || 'Europe/London')

    /* Extensions */

    // Fancy logs
    .use(Logestic.preset('fancy'))

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
      allowedHeaders: ['Content-Type', 'Authorization', 'Credentials', 'Origin', 'Host', 'os', 'ipCountry', 'X-Forwarded-For', 'X-Real-IP', 'X-Custom-Header', 'requestIP', 'Authentication-Method']
    }))

    // Helmet security (might conflict with swagger)
    .use(helmet({
      contentSecurityPolicy: {
        useDefaults: true
      }
    }))

    // Cookie global handler
    .use(cookie({ secure: Bun.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'strict'}))

    // JWT
    .use(
      jwt({
          name: Bun.env.JWTNAME,
          secret: Bun.env.JWSCRT!,
          exp: `${consts.auth.jwtMaxAge}d`
      })
  )
  
    // Rate limiter for added security
    .use(rateLimit({max: Bun.env.NODE_ENV === 'production' ? 5 : 15}))

    // CRON soul manager
    .use(cron({
      name: 'midnight-daily',
      pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
      // '*/1 * * * 1-6', // seconds (optional), minute, hour, day of the month, month, day of the week (RTL)
      timezone: Bun.env.TZ || 'Europe/London',
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

    // Serve HTML and other asset files
    .use(staticPlugin({
      ignorePatterns: ['*.mov'],
      prefix: '/public',
      assets: 'public'
    }))

    // HTMX plugin
    .use(htmx())

    // Get IP of client and add to context
    .use(ip({ checkHeaders: ["X-Forwarded-For", "X-Real-IP", "Authentication-Method"] }))


    // Life cycles
    .derive(sessionDerive) // Adds User and Session data to context - from token/cookie
    .onBeforeHandle([checkMaintenanceMode]) // Checks if server is in maintenance mode
    .onError(({ code, error, set }:any) => ErrorMessages(code, error, set)) // General Error catching system
    .onStop(gracefulShutdown)
    // .onRequest(requestLogger) // replaced by Logestic
    .mapResponse(customResponse);

    // ROUTES
    registerControllers(app as any);

    process.on('SIGINT', app.stop);
    process.on('SIGTERM', app.stop);

    // initialize server
    app.listen(PORT, bootLogger);
  } else {
    console.error("Can only be initialized using Bun");
    
  }
} catch (e) {
  console.log('Error firing up the server');
  console.error(e);
}