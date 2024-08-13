import { HttpStatusEnum } from "elysia-http-status-code/status";

export const banAgentInsomnia = (ctx:any)=>{
  const { headers } = ctx;
    // console.log(headers["user-agent"])

    if(headers["user-agent"] === 'insomnia/2023.4.0'){
      return { message: 'Insomnia Agent FORBIDDEN ' }
    }
}


export const checkMaintenanceMode = ({set, store}:any) => {

  if(store.maintenanceMode){
      console.log("Maintenance Mode: ON");
      set.status = HttpStatusEnum.HTTP_423_LOCKED;
      return { message: 'System currently undergoing maintenance', note: 'Admin has locked this application' };
  }
}