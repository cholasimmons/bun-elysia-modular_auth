import Elysia, { t } from "elysia";
import { UsersController, UsersService } from ".";
import { AuthService } from "../auth";
import { checkAuth, checkEmailVerified, checkForProfile, checkIsAdmin, checkIsStaff } from "~middleware/authChecks";
import { AutoUserBodyDTO, AutoUserResponseDTO, UserResponseDTO, profileQueriesDTO, ProfileResponseDTO, ProfileBodyDTO, updateProfileBodyDTO, userQueriesDTO } from "./users.model";
import { swaggerDetails } from "~utils/response_helper";
import { paginationOptions } from "~modules/root/root.models";

const users = new UsersController();

export const UsersHandler = new Elysia({
    prefix: '/users',
    detail: { description:'User management endpoint', tags: ['Users'] }
})
    // Lifecycle, auth
    .onBeforeHandle([checkAuth])

    // Get all Users [STAFF]
    .get('/', users.getAllUsers, {
        beforeHandle: [ checkIsAdmin || checkIsStaff, checkForProfile ],
        query: t.Object({
            ...paginationOptions,
            ...userQueriesDTO,
        }),
        response: {
            200: t.Object({ data: t.Array(UserResponseDTO), message: t.Optional( t.String({ default: 'Successfully retrieved Users' }) ) }),
            404: t.Object({ message: t.String({ default: 'No Users found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not fetch Users' }) })
        },
        detail: swaggerDetails('Get All Users', 'Fetches all available User Accounts (toggle between active or not via isActive query)'),
    })

    // Get Current logged in User [SELF]
    .get('/user', users.getAccountById, {
        query: t.Object({ ...userQueriesDTO }),
        response: {
            200: t.Object({ data: UserResponseDTO, message: t.String({ default: 'Successfully retrieved User' }) }),
            404: t.Object({ message: t.String({ default: 'User with that ID not found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not search for a User' }) })
        },
        detail: swaggerDetails('Get User Account', 'Fetch current User Account')
    })

    // Get single User by ID [STAFF]
    .get('/user/:userId', users.getAccountById, {
        beforeHandle: [checkIsStaff || checkIsAdmin],
        params: t.Object({
            userId: t.String()
        }),
        query: t.Object({ ...userQueriesDTO }),
        response: { 
            200: t.Object({ data: UserResponseDTO, message: t.String({ default: 'Successfully retrieved User' }) }),
            404: t.Object({ message: t.String({ default: 'User with that ID not found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not fetch a User' }) })
        },
        detail: swaggerDetails('Get User Account by ID [Staff]', 'Fetch User Account by userId param (Staff only)')
    })


    .get('/profile', users.getMyProfile,{
        query: t.Object({ ...profileQueriesDTO }),
        response: {
            200: t.Object({ data: ProfileResponseDTO, message: t.String({ default:'Successfully retrieved your User Profile' }) }),
            404: t.Object({ message: t.String({ default:'Could not fetch Profile' })}),
            406: t.Object({ message: t.String({ default:'Profile is deactivated' })}),
            500: t.Object({ message: t.String({ default:'Could not load User Profile of that ID' }), note: t.String()}),
        },
        detail: swaggerDetails('Get User Profile', 'Fetch current User Profile')
    })

    .get('/profile/:userId', users.getProfileByUserId,{
        beforeHandle: [ checkIsStaff || checkIsAdmin ],
        params: t.Object({ userId: t.String() }),
        query: t.Object({ ...profileQueriesDTO }),
        response: {
            200: t.Object({ data: ProfileResponseDTO, message: t.String({ default:'Successfully retrieved User Profile' }) }),
            404: t.Object({ message: t.String({ default:'Profile not available' })}),
            500: t.Object({ message: t.String({ default:'Could not load User Profile of that ID' })}),
        },
        detail: swaggerDetails('Get User Profile by ID [Staff]', 'Fetch User Profile by userId param (Staff only)')
    })

    .get('/profiles', users.getAllProfiles, {
        beforeHandle: [ checkIsStaff || checkIsAdmin ],
        query: t.Object({ ...paginationOptions, ...profileQueriesDTO }),
        response: {
            200: t.Object({ data: t.Array(ProfileResponseDTO), message: t.String({ default: 'Successfully retrieved n User Profiles' }) }),
            404: t.Object({message: t.String({ default: 'No User Profiles found' }) }),
            500: t.Object({message: t.String({ default: 'Unable to fetch User Profiles' }) })
        },
        detail: swaggerDetails('Get all User Profiles [Staff]', 'Fetch User Profiles (Staff only)')
    })

    // Add a new Post User Account [ADMIN]
    .get('/autousers', users.getAllAutoEnrollers,{
        beforeHandle:[checkIsAdmin || checkIsStaff],
        response: {
            200: t.Object({ data: t.Array(AutoUserResponseDTO), message: t.String({ default: 'Retrieved all Auto-Users' }) }),
            500: t.Object({ message: t.String({ default: 'Could not fetch Auto-Users.'}) })
        },
        detail: swaggerDetails('Get Auto Users [Staff]', 'Fetch all Auto Users (Staff only)')
    })

    // Get Current logged in User's active status [SELF]
    .get('/status/user', users.getAccountStatus, {
        response: {
            200: t.Object({ data: t.BooleanString(), message: t.String({ default: 'Retrieved User Account status' }) }),
            404: t.Object({ message: t.String({ default: 'User with that ID not found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not fetch User\'s Active status' }) })
        },
        detail: swaggerDetails('Get User Account Status', 'Fetch current User\'s Account status')
    })

    // Get User's active status by userId [STAFF]
    .get('/status/user/:userId', users.getAccountStatus, {
        beforeHandle: [checkIsStaff || checkIsAdmin],
        params: t.Object({ userId: t.String() }),
        response: {
            200: t.Object({ data: t.BooleanString(), message: t.String({ default: 'Retrieved User Account status' }) }),
            404: t.Object({ message: t.String({ default: 'User with that ID not found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not fetch User\'s Active status' }) })
        },
        detail: swaggerDetails('Get User Account Status by ID [Staff]', 'Fetch User\'s Account status by their userId param [Staff]')
    })

    // Get Current logged in User's Profile status [SELF]
    .get('/status/profile', users.getProfileStatus, {
        beforeHandle: [ checkForProfile ],
        response: {
            200: t.Object({ data: t.BooleanString(), message: t.String({ default: 'Retrieved User Profile status' }) }),
            // 404: t.Object({ message: t.String({ default: 'User with that ID not found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not fetch your Profile status' }) })
        },
        detail: swaggerDetails('Get my Profile Status', 'Fetches your Profile status')
    })

    // Get User's Profile status by userId [STAFF]
    .get('/status/profile/:userId', users.getProfileStatus, {
        beforeHandle: [checkIsStaff || checkIsAdmin],
        params: t.Object({ userId: t.String() }),
        response: {
            200: t.Object({ data: t.BooleanString(), message: t.String({ default: 'Retrieved User Profile status' }) }),
            404: t.Object({ message: t.String({ default: 'User with that ID not found' }) }),
            500: t.Object({ message: t.String({ default: 'Could not fetch Profile status' }) })
        },
        detail: swaggerDetails('Get User Profile Status by ID [Staff]', 'Fetches User\'s Profile status by UserId param [Staff]')
    })


    /* POST */


    // Create new User Profile [SELF]
    .post('/profile', users.createNewProfile,{
        beforeHandle: [ checkEmailVerified ],
        body: ProfileBodyDTO,
        response: {
            201: t.Object({ data: ProfileResponseDTO, message: t.String({ default: 'Successfully created new User Profile' }) }),
            302: t.Object({ message: t.String({ default: 'A profile already exists with those credentials'}) }),
            403: t.Object({ message: t.String({ default: 'You are not email verified.', error: 'Email verification required'}) }),
            406: t.Object({ message: t.String({ default: 'Your submission was not valid.'}) }),
            409: t.Object({ message: t.String({ default: 'You already have a profile'}) }),
            500: t.Object({ message: t.String({ default: 'Problem processing profile submission.'}) })
        },
        detail: swaggerDetails('Create User Profile', 'Create a User Profile if email is verified')
    })

    // Add a new Post User Account [ADMIN]
    .post('/autouser', users.addNewAutoEnroller,{
        beforeHandle:[checkIsAdmin],
        body: AutoUserBodyDTO,
        response: {
            201: t.Object({ data: AutoUserResponseDTO, message: t.String({ default: 'Successfullly addedd an Auto-User' }) }),
            500: t.Object({ message: t.String({ default: 'Could not create Auto-User.'}) })
        },
        detail: swaggerDetails('Create Auto User [Admin]', 'Appends a new Auto Enrol User (Admin only)')
    })


    /* PATCH */


    // Update User Profile [SELF]
    .patch('/profile', users.updateUserProfile, {
        query: t.Object({ ...profileQueriesDTO }),
        body: t.Object({...updateProfileBodyDTO}),
        response: {
            200: t.Object({ data: ProfileResponseDTO, message: t.String({ default: 'Successfully updated User Profile.'}) }),
            404: t.Object({ message: t.String({ default: 'Could not update Profile' })}),
            500: t.Object({ message: t.String({ default: 'Could not modify User Profile.' })})
        },
        detail: swaggerDetails('Update User Profile', 'Updates the current User\' Profile')
    })

    // Update other User Profile [STAFF]
    .patch('/profile/:userId', users.updateUserProfile, {
        beforeHandle: [checkIsStaff],
        params: t.Object({ userId: t.String() }),
        query: t.Object({ ...profileQueriesDTO }),
        body: t.Object({...updateProfileBodyDTO}),
        response: {
            200: t.Object({ data: ProfileResponseDTO, message: t.String({ default: 'Successfully updated User Profile.'}) }),
            404: t.Object({ message: t.String({ default: 'Could not update Profile' })}),
            500: t.Object({ message: t.String({ default: 'Could not modify User Profile.' })})
        },
        detail: swaggerDetails('Update User Profile by ID [Staff]', 'Updates User Profile by their userId param (Staff only)')
    })

    // Activate/Deactivate User Profile [SELF]
    .patch('/user/deactivate', users.deactivateUser, {
        body: t.Optional(t.Object({ isComment: t.String() })),
        response: {
            200: t.Object({ data: t.Optional(UserResponseDTO), message: t.String() }),
            // 404: t.Object({ message: t.String({ default: 'Profile not found' })}),
            // 500: t.Object({ message: t.String({ default: 'Could not modify User Profile.' })})
        },
        detail: swaggerDetails('Deactivate User Account [Self]', 'Deactivates current User\'s Account')
    })

    // Activate/Deactivate User Profile [STAFF | ADMIN]
    .patch('/user/deactivate/:userId', users.deactivateUser, {
        beforeHandle: [ checkIsStaff || checkIsAdmin ],
        params: t.Object({ userId: t.String() }),
        body: t.Object({ isComment: t.String() }),
        response: {
            200: t.Object({ data: t.Optional(UserResponseDTO), message: t.String() }),
            // 404: t.Object({ message: t.String({ default: 'Profile not found' })}),
            // 500: t.Object({ message: t.String({ default: 'Could not modify User Profile.' })})
        },
        detail: swaggerDetails('Deactivate User Account [Admin, Staff]', 'Deactivates User Account by their userId param (Admin, Staff)')
    })