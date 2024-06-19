import { HttpStatusEnum } from 'elysia-http-status-code/status';
import consts from '~config/consts';

class RootController {
  constructor(){}

  async helloWorld({set, user, session, request:{ headers }}: any) {
    try {
      console.log("User: ",user);
      console.log("Session: ",session);
      console.log("ProfileID: ",user?.profileId ?? null);
      console.log(headers.get('accept'));
      
      const isBrowser = headers.get('accept').includes('text/html');
      
      return isBrowser ? Bun.file('public/welcome.html') : { message: `Welcome to the ${consts.server.name} Server! Version ${consts.server.version}` }
    } catch (error) {
      console.error(error);

      set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
      return { message: `Error occurred` }
    }
  }

  async helloTime({ user, session, params, store:{timezone} }: any) {

    console.log("User: ",user);
    console.log("Session: ",session);
    console.log("ProfileID: ",user?.profileId ?? null);

    const currentHour = new Date().getHours();

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
      return { message: `It's a beautiful ${getGreeting()} in ${timezone ?? 'your area'} isn't it ${params?.name || ''}?` }
    } catch (error) {
      console.error(error);

      return { message: `Error occurred` }
    }
  }

  async htmx({ hx, ip }: any) {
    
    console.log(ip);
    console.log(hx);
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
}

export default new RootController();