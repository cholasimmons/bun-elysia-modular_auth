import Elysia from "elysia";
import homeController from "src/controllers/home.controller";
import HomeController from "src/controllers/home.controller";

// const homeRouter = <Prefix extends string | undefined>({ name,prefix  }: { name?:string; prefix?: Prefix }) => new Elysia({ name:"Home Module", prefix })
function homeRouter(app: any) { 
    return app
        .get('/', homeController.home, 
            {
                
                beforeHandle: (ctx:any) => {
                    const { maintenance } = ctx.store;
                    console.log('Maintenace Mode: '+(maintenance ? 'On' : 'Off'));
                }, error(error:any){
                    return 'Issue resolved '+error.code;
                }
            }
        )

        .get('/test', () => {
            // ctx.log.error('Home Route functioning!');
            // ctx.log.info('Home Route functioning!!');
            // ctx.log.debug('Home Route functioning!!!');
            return '/test working';
        })

        .get('/two', homeController.home);
}
export default homeRouter;