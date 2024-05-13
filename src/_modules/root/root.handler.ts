
import Elysia, { t } from "elysia";
import { RootController } from "~modules/root";
import { checkAuth, checkForProfile, checkJWTAuth } from "~middleware/authChecks";

const rootHandler = new Elysia({ prefix: '' })

    .get('/', RootController.helloWorld, {
        detail: {description: 'Hello World', tags: ['root'] },
    }) // main route

    .get('/hello', RootController.helloTime, {
        beforeHandle: [checkAuth],
        detail: {description: 'Greeting + time', tags: ['root'] },
    }) // hello route
      
    .get('/hello/:name', RootController.helloTime, {
        beforeHandle: [checkAuth, checkForProfile],
        detail: {description: 'Greeting + time', tags: ['root'] },
        params: t.Object({ name: t.String() })
    }) // hello + name route

export default rootHandler;