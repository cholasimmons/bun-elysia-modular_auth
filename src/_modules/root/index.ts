import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { constants } from "~config/constants";
import { swaggerDetails } from "~utils/response_helper";
import { zambiaProvinces } from "./provinces";

export const RootHandler = new Elysia({
  detail: {
    description: "Root endpoints",
    tags: ["Home"],
  },
})

  .state("maintenanceMode", process.env.MAINTENANCE_MODE === "true" || false)
  .state("timezone", String(process.env.TZ || "Europe/London"))

  .get(
    "/",
    ({ set, request: { headers } }) => {
      try {
        const isBrowser = headers.get("accept")?.includes("text/html");

        return isBrowser
          ? Bun.file("public/welcome.html")
          : {
              message: `Welcome to the ${constants.server.name} Server! Version ${constants.server.version}`,
            };
      } catch (error) {
        // console.error(error);

        // Re-throw to let global error handler handle it
        throw error;
      }
    },
    {
      detail: swaggerDetails("Hello World"),
    },
  ) // main route

  .get(
    "/hello",
    ({ status, params, store }) => {
      const timezone = store?.timezone;
      const currentHour = new Date().getHours();
      const paramName = params?.name || "";

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
        return {
          message: `It's a beautiful ${getGreeting()} in ${timezone ?? "your area"} isn't it ${paramName}?`,
        };
      } catch (error) {
        console.error(error);

        return { message: `Error occurred` };
      }
    },
    {
      response: {
        200: t.Object({}),
      },
      params: t.Object({ name: t.Optional(t.String()) }),
      // beforeHandle: [checkAuth],
      detail: swaggerDetails("Timezone Greeting"),
    },
  ) // hello route

  .get(
    "/hello/:name",
    ({ status, params, store }) => {
      const timezone = store?.timezone;
      const currentHour = new Date().getHours();
      const paramName = params?.name || "";

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
        return {
          message: `It's a beautiful ${getGreeting()} in ${timezone ?? "your area"} isn't it ${paramName}?`,
        };
      } catch (error) {
        console.error(error);

        return { message: `Error occurred` };
      }
    },
    {
      detail: swaggerDetails("Timezone Greeting + Name"),
      params: t.Object({ name: t.String() }),
    },
  ) // hello + name route

  .get(
    "/htmx",
    ({ status, hx, ip }: any) => {
      console.log("ip ", ip);
      console.log("hx", hx);

      try {
        return status(200, {
          data: hx
            ? {
                request: hx.request,
                boosted: hx.boosted,
                historyRestoreRequest: hx.historyRestoreRequest,
                currentURL: hx.currentURL,
                prompt: hx.prompt,
                target: hx.target,
                triggerName: hx.triggerName,
                trigger: hx.trigger,
                isHTMX: hx.isHTMX,
              }
            : "No HTMX data",
          message: `HTMX test route. IP: ${ip ?? "Unknown"}`,
        });
      } catch (error) {
        console.error(error);

        return status(500, { message: `Error occurred` });
      }
    },
    {
      detail: swaggerDetails("HTMX", "HTMX test route"),
    },
  ) // htmx test route

  /*** Sample data to test Mobile App */
  .get(
    "/provinces",
    ({ status, set }) => {
      const provinces = zambiaProvinces;

      // set.status = HttpStatusEnum.HTTP_200_OK;
      return status(200, {
        data: provinces,
        message: `Retrieved all ${provinces.length} provinces`,
      });
    },
    {
      detail: swaggerDetails(
        "Fetch Demo App data",
        "Returns data to showcase in Mobile App",
      ),
    },
  )

  /*** Initialize App */
  .get(
    "/init",
    ({ status, set, store }) => {
      const spec = {
        name: constants.server.name,
        version: constants.server.version,
        maintenance: store.maintenanceMode ?? "Unavailable",
        timezone: store.timezone,
        creator: constants.server.author,
        host: "Hetzner Cloud, Helsinki",
      };

      // set.status = HttpStatusEnum.HTTP_200_OK;
      return status(200, { data: spec, message: `All Systems GO!` });
    },
    {
      detail: swaggerDetails(
        "Initialize App",
        "Returns data beneficial to initialization",
      ),
    },
  )

  .get(
    "/health",
    ({ status, store }) => {
      const spec = {
        "Server Name": constants.server.name,
        Version: constants.server.version,
        "Maintenance Mode": store.maintenanceMode ?? "Unavailable",
        Timezone: store.timezone,
        Creator: constants.server.author,
      };

      return status(200, { data: spec, message: `All Systems GO!` });
    },
    {
      // beforeHandle: [checkAuth],
      detail: swaggerDetails("System Health", "Check system health"),
    },
  ); // hello route
