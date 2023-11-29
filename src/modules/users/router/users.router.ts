import { Elysia, t } from "elysia";
import UserController from "../controllers/users.controller";

function usersRouter(app: Elysia){
    return app
        .get('/', ()=>'Users working')
        
        .get('/user', UserController.getUser, {
            // body: t.Object({
            //     user: t.Nullable(t.Object({
            //         names: t.String(),
            //         email: t.String(),
            //         password: t.String()
            //     }))
            // }),
            detail: {
                tags: ['Get a Single User']
            }
        })
        
        // GET Profile
        .get('/profile', UserController.profile,
            {
                query: t.Object({
                    name: t.Optional(t.String()),
                    age: t.Optional(t.Numeric())
                })
            })
        
        // GET :ID :Gender
        .get('/:id/:gender', UserController.gender,
            {
                detail: {
                    tags: ['Users']
                },
                params: t.Object({
                    id: t.Numeric({exclusiveMaximum: 80}),
                    gender: t.Optional(t.Enum({male:"Male", female:"Female", other:"Other"}))
                }),
                error: ()=>'An ID number and gender of Male/Female are required'
            });
}

export default usersRouter;