import Elysia from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { HttpStatusEnum } from "elysia-http-status-code/status";

export const checkSystem = (ctx:any)=>{

    const {store} = ctx;
    // console.log(store.maintenance);
    if(store.maintenance === true){
        ctx.set.status = HttpStatusEnum.HTTP_423_LOCKED;
        console.log('Maintenance Mode activated');
        
        return 'Service undergoing maintenance';
    }
}