import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { constants } from '~config/constants';
import { zambiaProvinces } from './provinces';

export class RootController {
  constructor(){}

  async helloWorld({set, user, request:{ headers }}: any) {

    try {
      
      const isBrowser = headers.get('accept').includes('text/html');
      
      return isBrowser ? Bun.file('public/welcome.html') : { message: `Welcome to the ${constants.server.name} Server! Version ${constants.server.version}` }
    } catch (error) {
      // console.error(error);

      // Re-throw to let global error handler handle it
      throw error;
    }
  }

  async helloTime({ params, store }: any) {
    const timezone = store?.timezone;
    const currentHour = new Date().getHours();
    const paramName = params?.name || '';

    function getGreeting(): string {
      if (currentHour >= 5 && currentHour < 12) {
        return "morning";
      } else if (currentHour >= 12 && currentHour < 17) {
        return "afternoon";
      } else if (currentHour >= 17 && currentHour < 19) {
        return "evening";
      } else {
        return "night";
      }
    }

    try {
      return { message: `It's a beautiful ${getGreeting()} in ${timezone ?? 'your area'} isn't it ${paramName}?` }
    } catch (error) {
      console.error(error);

      return { message: `Error occurred` }
    }
  }

  async htmx({ hx, ip }: any) {
    
    console.log("ip ", ip);
    console.log("hx", hx);
    try {
      return { data: hx ? {
        request: hx.request,
        boosted: hx.boosted,
        historyRestoreRequest: hx.historyRestoreRequest,
        currentURL: hx.currentURL,
        prompt: hx.prompt,
        target: hx.target,
        triggerName: hx.triggerName,
        trigger: hx.trigger,
        isHTMX: hx.isHTMX,
      } : 'No HTMX data', message: `HTMX test route. IP: ${ip ?? 'Unknown'}` }
    } catch (error) {
      console.error(error);

      return { message: `Error occurred` }
    }
  }

  async provinces({ set }:any) {
    const provinces = zambiaProvinces;

    set.status = HttpStatusEnum.HTTP_200_OK;
    return { data: provinces, message: `Retrieved all ${provinces.length} provinces` }
  }

  async init({ set, store }:any) {
    const spec = {
      name: constants.server.name,
      version: constants.server.version,
      maintenance: store.maintenanceMode ?? 'Unavailable',
      timezone: store.timezone,
      creator: constants.server.author,
      host: 'Hetzner Cloud, Helsinki'
    };

    set.status = HttpStatusEnum.HTTP_200_OK;
    return { data: spec, message: `All Systems GO!` }
  }
  
  async health({store}:any){
    const spec = {
      "Server Name": constants.server.name,
      "Version": constants.server.version,
      "Maintenance Mode": store.maintenanceMode ?? 'Unavailable',
      "Timezone": store.timezone,
      "Creator": constants.server.author
    };

    return { data: spec, message: `All Systems GO!` }
  }

}