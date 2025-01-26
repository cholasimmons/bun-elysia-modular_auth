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
import { Logestic } from "logestic";

// Open Telemetry
import { opentelemetry } from '@elysiajs/opentelemetry';
import { BatchSpanProcessor, InMemorySpanExporter } from '@opentelemetry/sdk-trace-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { Resource } from '@opentelemetry/resources';


// Middleware
import { bootLogger, gracefulShutdown, requestLogger } from "~utils/systemLogger";
import { errorMessages } from "~middleware/errorMessages";
import { checkMaintenanceMode } from "~middleware/lifecycleHandlers";
import customResponse from "~middleware/customResponse";
import { sessionDerive } from "~middleware/session.derive";
import { headerCheck } from "~middleware/authChecks";

// Route Handler
import { v1 } from "./server";
import { FilesController } from "~modules/files";
import { AuthService, MessageService, NotificationService } from "~modules/index";

try {
  console.log("Initializing Elysia...");

  const authService = AuthService.instance;
  const files = new FilesController();
  const messageService = MessageService.instance;
  const notificationService = NotificationService.instance;

  if (import.meta.main) {
    const PORT = Bun.env.PORT || 3000;

    const app = new Elysia({
      name: consts.server.name,
      // websocket: { idleTimeout: consts.websocket.timeout },
      detail: { description: `${consts.server.name} Server API`, tags: ['Root'] }
    })

    // Temporarily disabled
    // if(Boolean(Bun.env.DO_TELEMETRY)){
    //   // OTLP Trace Exporter Configuration
    //   const traceExporter = new OTLPTraceExporter({
    //     url: `${Bun.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? ''}/v1/traces`,
    //     headers: { 'Content-Type': 'application/json' }
    //   });

    //   // Span Processor using BatchSpanProcessor for better performance
    //   const spanProcessor = new BatchSpanProcessor(traceExporter);

    //   app.use(opentelemetry({
    //     serviceName: consts.server.name,
    //     spanProcessors: [spanProcessor],
    //     resource: new Resource({
    //       ["service.name"]: consts.server.name,
    //       ["service.version"]: 1.0,
    //       ["deployment.environment"]: Bun.env.NODE_ENV
    //     })
    //   }))
    // }

        
    // Error Handling. Loads early up the vine
    app.onError(errorMessages)

    
    // State
    .state('maintenanceMode', Bun.env.MAINTENANCE_MODE === 'true' || false)
    .state('timezone', String(Bun.env.TZ || 'Europe/London'))


    /* Extensions */

    // Fancy logs
    .use(Logestic.preset("common"))


    // Swagger
    .use(swagger({ autoDarkMode: true,
      documentation: {
        info: {
            title: `${consts.server.name}`,
            version: `${consts.server.version}`,
            description: `Server API for ${consts.server.name}`,
            contact: {
              name: consts.server.author,
              email: consts.server.email
            }
        }
      },
      swaggerOptions: {
        syntaxHighlight: { theme: "monokai" }
      }
    }))

    // CORS security
    .use(cors({
      methods: ['OPTIONS', 'GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
      // origin: /localhost.*/,
      origin: ['http://localhost/*', 'http://localhost:3000/*', 'http://localhost:3000/v1/swagger'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Credentials', 'Origin', 'Host', 'os', 'ipCountry', 'X-Forwarded-For', 'X-Real-IP', 'X-Custom-Header', 'requestIP', 'X-Client-Type' ]
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
          secret: Bun.env.JWT_SECRET!,
          exp: `${consts.auth.jwtMaxAge}d`
      })
    )
  
    // Rate limiter for added security
    .use(rateLimit({max: Bun.env.NODE_ENV === 'production' ? 8 : 15}))

    // CRON soul manager
    .use(cron({
      name: 'midnight-daily',
      pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
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


        // TODO: Delete all inactive messages older than 30 days
        messageService.clearDeletedMessages().then((messages: any) => {
          console.log(messages);
          console.log(`Deleted ${messages.length} inactive messages`);
          
        });
      }
    }))

    // CRON soul manager 2
    .use(cron({
      name: 'per-10-minutes',
      pattern: Patterns.EVERY_10_MINUTES,
      timezone: Bun.env.TZ || 'Europe/Harare',
      maxRuns: undefined,
      run() {
        // Save all in-memory connections to database
        notificationService.manager.syncCacheWithDatabase().then((count: number) => {
          console.log(`Synced ${count} websocket connections to database`);
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
    .onStart(() => {
      notificationService.manager.syncDatabaseWithCache().then((count: number) => {
        console.log(`${count} stashed websocket connections restored`);
      });
    })
    .onBeforeHandle([checkMaintenanceMode, headerCheck]) // Checks if server is in maintenance mode
    .mapResponse(customResponse)
    .onStop(gracefulShutdown)

    // ROUTES
    .get('/', () => { return { message: 'Server running, select version'} })
    .ws("/ws", {
          ping: (message:string) => message,
          pong: (message:string) => message,
    })
    .use(v1)
    // registerControllers(app as any);


    process.on('SIGINT', () => {
      console.log('Stopping App...');

      // Close Redis system (disabled)
      //redisMessagingService.close();

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