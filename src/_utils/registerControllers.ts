// this might be deprecated later
export const registerControllers = (app: any, controllers: any[]) => {
    controllers.forEach((controller) => {
      app.use(controller.start());
    });
  };