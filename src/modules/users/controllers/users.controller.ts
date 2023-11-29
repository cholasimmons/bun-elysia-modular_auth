import { httpError } from "elysia-http-error";
import { HttpStatusCode } from "elysia-http-status-code";
import { LuciaError } from "lucia";
import UserService from "../services/user.service";
import { auth } from "~config/lucia";

class UsersController {

    static getUser = UserService.getUser

    static profile = () => {

        return UserService.profile;
    }

    static register = async (ctx:any) => {
        const {body, set} = ctx;
        await UserService.register(body, set);
    }

    static gender = (ctx:any) => {
        const { params: {gender, id} } = ctx;

        return `User ID: ${id}. ${gender}`
    }


}

export default UsersController;