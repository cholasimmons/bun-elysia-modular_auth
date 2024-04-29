import { HttpStatusEnum } from 'elysia-http-status-code/status';
import consts from '~config/consts';

class RootController {
  constructor(){}

  async helloWorld({set, user, session, log}: any) {
    log.error(user, "User");
    log.info(session, "Session");

    try {
      console.log(user);
      console.log(session);
      console.log(user?.profileId ?? null);
      
      return { message: `Welcome to the ${consts.server.name} Server! Version ${consts.server.version}` }
    } catch (error) {
      console.error(error);

      set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
      return { message: `Error occurred` }
    }
  }

  async helloTime({ user, session, params, store:{timezone} }: any) {

    console.warn(user);
    console.warn(session);

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
      return { message: `It's a beautiful ${getGreeting()} in ${timezone ?? 'your area'} isn't it ${params?.name || ''}.` }
    } catch (error) {
      console.error(error);

      return { message: `Error occurred` }
    }
  }
}

export default new RootController();