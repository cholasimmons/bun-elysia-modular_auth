import { Elysia, t } from 'elysia';
import { IRegister } from '../../auth/models/register.model';
import { db } from '~config/prisma';
import { auth } from '~config/lucia';
import { httpError } from 'elysia-http-error';
import { HttpStatusEnum } from 'elysia-http-status-code/status';

export default class UserService{

    // Register a new User
    static async register(body: IRegister, set:any){
        const {names, email} = body;

        const exists = await db.user.findUnique({
            where:{
                email: email
            },
            select: {
                id: true,
                email: true
            }
        })

        if(exists)
        {
            set.status = 409;
            return 'User already exists';
        }

        await db.user.create({
            data: body
        })

        console.log('User created!');
        

        return `${names} ${email}`;
    }
    

    // View User Profile
    static profile = (query: any) => {
        let name: string|undefined;
        let age: string|undefined;

        if(query.name){
            name = `User found: ${query.name}. `;
        }
        if(query.age){
            age = `Everybody has an age. ${query.age}`;
        } else {
            return 'No Profile queries';
        }
        return name + ' ' + age;
    };


    static getUser = async (ctx:any) => {
        console.warn('[User Service] ',ctx.request);
        
        const { request, set, body } = ctx;
        const authRequest = auth.handleRequest(ctx);
        const session = await authRequest.validate(); // or `authRequest.validateBearerToken()`
        if (session) {
            const user = session.user;
            const email = user.email;
            return user;
        }
        // console.log('No Session');
        set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
        return null
    }
}