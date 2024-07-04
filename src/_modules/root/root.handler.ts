
import Elysia, { t } from "elysia";
import { RootController } from "~modules/root";
import { checkAuth, checkForProfile } from "~middleware/authChecks";

const rootHandler = new Elysia({ detail: { description:'User management endpoint', tags: ['root']} })

    .get('/', RootController.helloWorld, {
        detail: {description: 'Hello World' },
    }) // main route

    .get('/hello', RootController.helloTime, {
        beforeHandle: [checkAuth],
        detail: {description: 'Greeting + time' },
    }) // hello route
      
    .get('/hello/:name', RootController.helloTime, {
        beforeHandle: [checkAuth, checkForProfile],
        detail: {description: 'Greeting + time' },
        params: t.Object({ name: t.String() })
    }) // hello + name route
    
    .get('/htmx', RootController.htmx, {
        detail: {description: 'HTMX test route' }
    }) // htmx test route

export default rootHandler;