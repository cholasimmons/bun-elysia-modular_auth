import { Elysia } from "elysia";

// Configurations
import consts from "~config/consts";
import { lucia } from "~config/lucia";

// Plugins
import { swagger } from "@elysiajs/swagger";
import { rateLimit } from "elysia-rate-limit";
import cron, { Patterns } from "@elysiajs/cron";
import cors from "@elysiajs/cors";
import { helmet } from "elysia-helmet";
import jwt from "@elysiajs/jwt";
import { staticPlugin } from '@elysiajs/static';
import { htmx } from "elysia-htmx";

// Middleware
import { bootLogger, gracefulShutdown, requestLogger } from "~utils/systemLogger";
import { errorMessages } from "~middleware/errorMessages";
import { checkMaintenanceMode } from "~middleware/lifecycleHandlers";
import customResponse from "~middleware/customResponse";
import { sessionDerive } from "~middleware/session.derive";

// Route Handler
import { registerControllers } from "./server";
// import { logger } from "@bogeychan/elysia-logger";
import { ip } from "elysia-ip";
import { Logestic } from "logestic";
import { FilesController } from "~modules/files";
import { AuthService } from "./_modules";
import { DatabaseError } from "./_exceptions/custom_errors";
import { redisMessagingService } from "~config/redis";


try {
  console.log("Initializing Elysia...");

  const authService = AuthService.getInstance();
  const files = new FilesController();

  if (import.meta.main) {
    const PORT = Bun.env.PORT || 3000;

    const app = new Elysia({
      name: consts.server.name,
      prefix: `/v${consts.api.version}`,
      websocket: { idleTimeout: consts.websocket.timeout },
      detail: { description: `${consts.server.name} Server API` }
    })

    // Error Handling
    .onError(errorMessages)
    
    // State
    .state('maintenanceMode', Bun.env.MAINTENANCE_MODE === 'true' || false)
    .state('timezone', String(Bun.env.TZ || 'Europe/London'))


    /* Extensions */

    // Fancy logs
    .use(Logestic.preset("common"))


    // Swagger
    .use(swagger({ autoDarkMode: true, documentation: {
      info: {
          title: `${consts.server.name}`,
          version: `${consts.server.version}`,
          description: `Server API for ${consts.server.name}`
      }},
    }))

    // CORS security
    .use(cors({
      // origin: ['http://localhost', 'http://localhost:5173'],
      methods: ['OPTIONS', 'GET', 'PUT', 'POST', 'PATCH'],
      credentials: true,
      origin: /localhost.*/,
      allowedHeaders: ['Content-Type', 'Authorization', 'Credentials', 'Origin', 'Host', 'os', 'ipCountry', 'X-Forwarded-For', 'X-Real-IP', 'X-Custom-Header', 'requestIP', 'Authentication-Method', 'X-Client-Type' ]
    }))

    // Helmet security (might conflict with swagger)
    .use(helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src-elem": ["https://cdn.jsdelivr.net/"],
          "script-src": ["'self'", "https://cdn.jsdelivr.net/"],
        },
      }
    }))

    // Cookie global handler
    // .use(cookie({ secure: Bun.env.NODE_ENV === 'production', httpOnly: true, sameSite: 'strict'}))

    // JWT
    .use(
      jwt({
          name: 'jwt',
          secret: Bun.env.JWSCRT!,
          exp: `${consts.auth.jwtMaxAge}d`
      })
    )
  
    // Rate limiter for added security
    .use(rateLimit({max: Bun.env.NODE_ENV === 'production' ? 8 : 15}))

    // CRON soul manager
    .use(cron({
      name: 'midnight-daily',
      pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
      // '*/1 * * * 1-6', // seconds (optional), minute, hour, day of the month, month, day of the week (RTL)
      timezone: Bun.env.TZ || 'Europe/London',
      maxRuns: undefined,
      run() {
        authService.clearExpiredEmailVerificationCodes().then((res:any) => {
          console.log("Cleared all expired verification codes. ",res)
        });

        files.fileRecon().then((r:any) => {
          console.log('File recon success. ',r.fileName);
        }).catch(e => {
          console.error("Couldn't recon file",);
        })

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
    // .use(ip({ checkHeaders: ["X-Forwarded-For", "X-Real-IP", "requestIP", "Authentication-Method"] }))



    // Life cycles
    .derive(sessionDerive) // Adds User and Session data to context - from token/cookie
    .onBeforeHandle([checkMaintenanceMode]) // Checks if server is in maintenance mode
    .mapResponse(customResponse)
    .onStop(gracefulShutdown);



    // ROUTES
    registerControllers(app as any);


    process.on('SIGINT', () => {
      console.log('Stopping App...');
      // close Redis system
      redisMessagingService.close();
      process.exit(0);
      // app.stop();
    });
    process.on('SIGSEGV', app.stop);
    process.on('SIGTERM', app.stop);
    process.on('SIGKILL', (e) => { console.error(e); app.stop; });


    console.log("Initializing Elysia... Done!");


    // initialize server
    app.listen(PORT, bootLogger);
  } else {
    console.error("Can only be initialized using Bun");
    
  }
} catch (e) {
  console.log('Error firing up the server');
  console.error(e);
}