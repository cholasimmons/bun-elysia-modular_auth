
import Elysia, { t } from "elysia";
import { RootController } from "~modules/root";
import { checkAuth, checkForProfile } from "~middleware/authChecks";
import { swaggerDetails } from "~utils/response_helper";

const root = new RootController();

export const RootHandler = new Elysia({ detail: { description:'Root endpoints', tags: ['Home']} })

    .get('/', root.helloWorld, {
        detail: swaggerDetails('Hello World'),
    }) // main route

    .get('/hello', root.helloTime, {
        // beforeHandle: [checkAuth],
        detail: swaggerDetails('Timezone Greeting'),
    }) // hello route
      
    .get('/hello/:name', root.helloTime, {
        detail: swaggerDetails('Timezone Greeting + Name'),
        params: t.Object({ name: t.String() })
    }) // hello + name route
    
    .get('/htmx', root.htmx, {
        detail: swaggerDetails('HTMX', 'HTMX test route')
    }) // htmx test route

    /*** Sample data to test Mobile App */
    .get('/provinces', root.provinces, {
        detail: swaggerDetails('Fetch Demo App data', 'Returns data to showcase in Mobile App')
    })

    /*** Initialize App */
    .get('/init', root.init, {
        detail: swaggerDetails('Initialize App', 'Returns data beneficial to initialization')
    })

    .get('/health', root.health, {
        // beforeHandle: [checkAuth],
        detail: swaggerDetails('System Health', 'Check system health'),
    }) // hello route
