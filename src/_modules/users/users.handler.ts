import Elysia, { t } from "elysia";
import { UsersController } from ".";
import { checkCookieAuth, checkForProfile, checkIsAdmin, checkIsStaff } from "~middleware/Auth";
import { UserQueriesDTO,AutoUserBodyDTO, AutoUserResponseDTO, UserResponseDTO, ProfileQueriesDTO, ProfileResponseDTO, ProfileBodyDTO, UpdateProfileDTO } from "./users.model";

const usersHandler = new Elysia({
    prefix: '/users',
    detail: { description:'User management endpoint', tags: ['Users'] }
})
    // Lifecycle, auth
    .onBeforeHandle(checkCookieAuth)

    // Get all Users [STAFF]
    .get('/', UsersController.getAllUsers, {
        beforeHandle: [ checkForProfile, checkIsStaff ],
        query: t.Object({ isActive: t.Optional(t.Boolean()) }),
        response: {
            200: t.Undefined( t.Object({ data: t.Array(UserResponseDTO), message: t.Optional( t.String({ default: 'Successfully retrieved Users' }) ) }) ),
            404: t.Object({ message: t.String({ default: 'No Users found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not fetch Users' }) })
        }
    })

    // Get Current logged in User [SELF]
    .get('/user', UsersController.getAccountById, {
        query: UserQueriesDTO,
        response: {
            200: t.Object({ data: UserResponseDTO, message: t.String({ default: 'Successfully retrieved User' }) }),
            404: t.Object({ message: t.String({ default: 'User with that ID not found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not search for a User' }) })
        }
    })

    // Get single User by ID [STAFF]
    .get('/user/:id', UsersController.getAccountById, {
        params: t.Object({
            id: t.String()
        }),
        query: UserQueriesDTO,
        response: { 
            200: t.Undefined(t.Object({ data: UserResponseDTO, message: t.String({ default: 'Successfully retrieved User' }) }) ),
            404: t.Object({ message: t.String({ default: 'User with that ID not found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not fetch a User' }) })
        }
    })

    .get('/profile/:id', UsersController.getProfileById,{
        beforeHandle: [],
        params: t.Object({ id: t.String() }),
        query: ProfileQueriesDTO,
        response: {
            200: t.Undefined(t.Object({ data: ProfileResponseDTO, message: t.String({ default:'Successfully retrieved User Profile' }) })),
            404: t.Object({ message: t.String({ default:'Profile not available' })}),
            500: t.Object({ message: t.String({ default:'Could not load User Profile of that ID' })}),
        }
    })

    .get('/profile', UsersController.getMyProfile,{
        query: ProfileQueriesDTO,
        response: {
            200: t.Object({ data: ProfileResponseDTO, message: t.String({ default:'Successfully retrieved your User Profile' }) }),
            403: t.Object({ message: t.String({ default:'Profile is deactivated' })}),
            404: t.Object({ message: t.String({ default:'Profile does not exist' })}),
            500: t.Object({ message: t.String({ default:'Could not load User Profile of that ID' })}),
        },
    })

    .get('/profiles', UsersController.getAllProfiles, {
        beforeHandle: [],
        query: ProfileQueriesDTO,
        response: {
            200: t.Undefined(t.Object({ profiles: t.Array(ProfileResponseDTO), message: t.String({ default: 'No User Profiles found' }) })),
            404: t.Object({message: t.String({ default: 'No User Profiles found' }) }),
            500: t.Object({message: t.String({ default: 'Unable to fetch User Profiles' }) })
        },
        
    })

    // Add a new Post User Account [ADMIN]
    .get('/autousers', UsersController.getAllAutoEnrollers,{
        beforeHandle:[checkIsAdmin],
        response: {
            200: t.Undefined(t.Object({ data: t.Array(AutoUserResponseDTO), message: t.String({ default: 'Retrieved all Auto-Users' }) }) ),
            500: t.Object({ message: t.String({ default: 'Could not fetch Auto-Users.'}) })
        }
    })


    /* POST */


    // Create new User Profile [SELF]
    .post('/profile', UsersController.createNewProfile,{
        body: ProfileBodyDTO,
        response: {
            201: t.Object({ data: ProfileResponseDTO, message: t.String({ default: 'Successfullly created new User Profile' }) }),
            302: t.Object({ message: t.String({ default: 'A profile already exists with those credentials'}) }),
            406: t.Object({ message: t.String({ default: 'Your submission was not valid.'}) }),
            409: t.Object({ message: t.String({ default: 'You already have a profile'}) }),
            500: t.Object({ message: t.String({ default: 'Problem processing profile submission.'}) })
        }
    })

    // Add a new Post User Account [ADMIN]
    .post('/autouser', UsersController.addNewAutoEnroller,{
        beforeHandle:[checkIsAdmin],
        body: AutoUserBodyDTO,
        response: {
            201: t.Undefined(t.Object({ data: AutoUserResponseDTO, message: t.String({ default: 'Successfullly addedd an Auto-User' }) }) ),
            500: t.Object({ message: t.String({ default: 'Could not create Auto-User.'}) })
        }
    })


    /* PUT */


    // Update User Profile [SELF]
    .put('/profile', UsersController.updateUserProfile, {
        query: ProfileQueriesDTO,
        body: UpdateProfileDTO,
        response: {
            200: t.Object({ data: ProfileResponseDTO, message: t.String({ default: 'Successfully updated User Profile.'}) }),
            404: t.Object({ message: t.String({ default: 'Profile not found' })}),
            500: t.Object({ message: t.String({ default: 'Could not modify User Profile.' })})
        }
    })

    // Update User Profile [STAFF]
    .put('/profile/:userId', UsersController.updateUserProfile, {
        params: t.Object({ userId: t.String() }),
        query: ProfileQueriesDTO,
        body: UpdateProfileDTO,
        response: {
            200: t.Object({ data: ProfileResponseDTO, message: t.String({ default: 'Successfully updated User Profile.'}) }),
            404: t.Object({ message: t.String({ default: 'Profile not found' })}),
            500: t.Object({ message: t.String({ default: 'Could not modify User Profile.' })})
        }
    })

    // Activate/Deactivate User Profile [STAFF]
    .put('/deactivate/user/:id', UsersController.deactivateUser, {
        params: t.Object({ userid: t.String() }),
        body: t.Object({ isActive: t.Boolean() }),
        response: {
            200: t.Object({ data: t.Optional(UserResponseDTO), message: t.String() }),
            // 404: t.Object({ message: t.String({ default: 'Profile not found' })}),
            // 500: t.Object({ message: t.String({ default: 'Could not modify User Profile.' })})
        }
    })


    

export default usersHandler;