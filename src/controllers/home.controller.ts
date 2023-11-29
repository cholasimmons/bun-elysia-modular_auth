import Elysia from "elysia";
import HomeService from "src/services/home.service";

const homeController = {

    home: async function (app: any) {
        const { query, state, params } = app;
        console.info('Query: ', query);

        return HomeService.loadHTML(query);
    }
}

export default homeController;