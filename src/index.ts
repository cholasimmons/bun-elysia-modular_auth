import { Elysia } from "elysia";
import { helmet } from "elysia-helmet";
import swagger from "@elysiajs/swagger";
import websocketRouter from "./router/websocket.router";
import authRouter from "~modules/auth";
import usersRouter from "~modules/users";
import homeRouter from "./router/home.router";
import { yoga } from "@elysiajs/graphql-yoga";
import { yogaDefs } from "~config/graphql";
import { html } from "@elysiajs/html";
import cookie from "@elysiajs/cookie";
import jwt from "@elysiajs/jwt";
import { logger } from "@bogeychan/elysia-logger";
import vehicleRouter from "~modules/vehicles";
import { checkSystem } from "./guards/systemCheck";

const port = Bun.env.SERVER_PORT || 3210;

const app = new Elysia({name: 'API Gateway', prefix: '/v1'})

// Global state
.state('version', 1)
.state('maintenance', false as boolean)
.decorate('maintenanceMode', (ctx:any)=> { ctx.store.maintenance})

.use(helmet())
.use(jwt({
    name: 'jwt',
    secret: Bun.env.JWT_SECRET!
  }))
.use(cookie())
.use(html())
// .use(HttpStatusCode())
.use(yoga(yogaDefs))
// .use(httpError())
.use(
  logger({
    level: 'error'
  })
)

/* Error Handling */
.onError(({code, error, set}) => {
  switch (code) {
    case 'NOT_FOUND':
      set.status = 404;
      return 'Resource not found';
    case 'VALIDATION':
      // set.status = 409;
      console.error('Validation. ',error);
      
      return 'DTO Resource not valid';
    default:
      set.status = 500;
      console.log('Error Message: ',error.message);
      console.log('Error Code: ',error.name);
      console.log('Code: ',code);
      return 'System error encountered';
  }

  // Error Codes:
    // INTERNAL_SERVER_ERROR
    // VALIDATION
    // PARSE
    // UNKNOWN
})

// Guarded Routes
.guard({
    beforeHandle: checkSystem
  }, app => app
      .get('/mode', ({store, query}) => {
        if(query.mode === 'true'){
          store.maintenance = true
        } else if (query.mode === 'false') {
          store.maintenance = false
        }

        return { 'Maintenance Mode': store.maintenance ? 'On' : 'Off' };
      })

      .group('', homeRouter) // Home Module

      .group('/users', usersRouter) // Users Module

      .group('/auth', authRouter) // Auth Module
    
      .group('/vehicles', vehicleRouter) // Vehicles Module
)


// Websocket
// app.use(websocketRouter)

/* Swagger */
.use(swagger({
  path:'/swagger',
  documentation: {
    info: {
      title: 'Server Doc',
      version: '0.9.1'
    },
    // tags: [
    //   {name: 'Users', description: 'Users API'},
    //   {name: 'Auth', description: 'Auth API'}
    // ]
  }
}))


.listen(port);
console.log(
  `🦊 Elysia up & running 18x faster! - BunJS.
💾 ${app.server?.hostname}:${app.server?.port}`
);
