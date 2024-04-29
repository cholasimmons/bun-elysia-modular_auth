import { UsersService } from "~modules/users";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { db } from "~config/prisma";
import { AutoEnrol, Profile, User } from "@prisma/client";
import { AuthService } from "..";
import { lucia } from "~config/lucia";


class UsersController {
    constructor(public usersService: UsersService, public authService: AuthService) {
        // super('/auth');
      }

    /* GET */

    // STAFF: Get ALL Users, or only active ones via query ?isActive=true/false
    async getAllUsers({ set, query: { isActive }, log }:any):Promise<{data: User[], message: string}|{message: string}> {
        log.error(isActive, "IsActive");
        log.info(set.status, "Status");
        try {
            const users = await usersService.getAll(isActive);

            if(!users){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                throw 'No Users found'
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: users, message: `Successfully retrieved ${users.length > 1 ? users.length : ''} Users` }
        } catch (err:any) {
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: err.toString() ?? 'Could not fetch Users' }
        }
        
    }

    // Retrieve single User [ADMIN | SELF]
    async getAccountById({ set, user, params, query:{ profile } }:any) {        
        const user_id = params?.id ?? user.id;        

        try {
            if(!user_id){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No User details found' };
            }

            const u: Partial<User> = await usersService.getUser(user_id, {profile})

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: u, message: 'Successfully retrieved User' };
        } catch (err) {
            console.error(err);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not fetch a User' }
        }
    }

    // Retrieve single User Profile [ADMIN]
    async getProfileById({ set, params, query }: any):Promise<{data: Profile, message:string}|{message:string}> {
        const { user } = query;

        // const user_id = params?.id ?? user.userId;

        try {
            const profile = await db.profile.findUnique({
                where: {
                    userId: params.id
                },
                include: {
                    user: user ?? false,
                }
            });

            if(!profile){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Profile not found' };
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: profile, message: 'Successfully retrieved User Profile' };
        } catch(e) {
            console.warn(e);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not load User Profile of that ID' }
        }
    }

    // Retrieve currently logged in User's Profile [SELF]
    async getMyProfile({ set, user }: any){

        try {
            const profile = await db.profile.findUnique({
                where: { userId: user.userId },
                include: {
                    user: false
                }
            });

            if(!profile){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Profile does not exist'};
            }

            if(!profile.isActive){
                set.status = HttpStatusEnum.HTTP_403_FORBIDDEN;
                return { message: 'Profile is deactivated' };
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: profile, message: 'Successfully retrieved your User Profile' };
        } catch(e) {
            console.warn(e);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Unable to access profile storage.' }
        }
    }

    // Retrieve all User Profiles [STAFF]
    async getAllProfiles({ set, query }: any):Promise<{profiles: Profile[], message:string}|{message:string}>{
        const { user} = query;

        try {
            const profiles = await db.profile.findMany({
                include: {
                    user: user ?? false,
                }
            });

            if(!profiles){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No User Profiles found' };
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { profiles: profiles, message: `Successfully retrieved ${profiles.length > 1 ? profiles.length : ''} User Profiles` };
        } catch(e:any) {
            console.warn(e);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not retrieve User Profiles' }
        }
    }

    // Fetch all Auto-Users
    async getAllAutoEnrollers({ set }:any){
        try {
            const autos = await db.autoEnrol.findMany();

            if(!autos){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { data: [], message:'Could not retrieve auto-enrollers' }
            }

            set.status = 200;
            return { data: autos, message:'' }
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message:'An internal error occurred with auto-enrollment' }
        }
    }


    /* POST */  


    async createNewProfile({ set, body, user, session, user:{ id, firstname, lastname, email, phone, roles, profileId }, request:{ headers }, cookie:{ BusPlus1 } }:any) {
        console.log("User: ", user);
        console.log("Session: ", session);
        

        try {
            // Checking if ProfileID exists in session
            if(profileId){
                // Checking if User already has a Profile 
                const profile = await db.profile.findUnique({ where: {id:profileId}, select: {id:true} })

                if(profile){
                    set.status = HttpStatusEnum.HTTP_409_CONFLICT;
                    return { message: `You already have a profile.` }
                }
            }

            

            // console.log('Checking for pre-existing Profile of similar credentials...');
            // Check DB for profile of same nrc/passport number
            const profileExists = await db.profile.findFirst({
                where: {
                    documentId: body.documentId,
                    documentType: body.documentIdType
                }
            });
            if(profileExists){
                set.status = HttpStatusEnum.HTTP_302_FOUND;
                return { message: 'A profile already exists with those credentials' };
            }


            // let imageID: { etag: any; versionId: string|null}|null = null;
            let uploadedImage: {etag:string; versionId:string|null}|null = null;
            // If User uploaded a photo, persist it to File Server and add it's ID to profile
                
            if(body.photo){
                try{
                    // uploadedImage = await usersService.uploadPhoto(body.photo) 
                } catch(err) {
                    console.error(err);
                }
            }

            const autoUser: Partial<AutoEnrol>|null = await db.autoEnrol.findFirst({ where:{ email: email}, select:{ supportLevel:true } })

            // Append user & image ID to profile
            const ammendedProfile = {
                firstname: body.firstname ?? firstname,
                lastname: body.lastname ?? lastname,
                documentId: body.documentId,
                documentType: body.documentType,
                gender: body.gender,
                bio: body.bio ?? null,
                email: body.email ?? email,
                phone: body.phone ?? phone,
                supportLevel: autoUser?.supportLevel ?? 0,
                userId: id,
                photoId: uploadedImage ?? null
            }

            if(autoUser?.supportLevel && autoUser?.supportLevel > 0){
                await db.autoEnrol.update({ where: { email: email}, data: { isActive: false, isComment: `Used for Profile Registration at ${new Date()}` } });
            }

            const newProfile = await usersService.createUserProfile(ammendedProfile)
            // console.debug("Profile Created: ", newProfile);
            
            if(!newProfile){
                set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
                return { message: 'Problem processing profile submission.' }
            }

            const sess = await authService.createLuciaSession(user.id, headers);
            const sessionCookie = lucia.createSessionCookie(sess.id);
            await lucia.invalidateSession(BusPlus1.value);
            
            set.status = HttpStatusEnum.HTTP_201_CREATED;
            set.headers["Set-Cookie"] = sessionCookie.serialize();
            return { data: newProfile, message: `User Profile successfully created. ${!!uploadedImage ? '' : '(No image)'}` }
        } catch(err:any){
            console.warn(`errrr ${err}`);

            // if(err instanceof SharpImageError){
            //     console.warn("Sharp ",err);
                
            //     set.status = err.errorCode;
            //     return { message: err.message }
            // }
 
            // if(err instanceof PrismaClientValidationError){
            //     set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
            //     return { message: 'Your submission was not valid' }
            // }
            // if(false){ // err instanceof PrismaClientKnownRequestError
            //     set.status = HttpStatusEnum.HTTP_409_CONFLICT;
            //     return { message: 'Profile already exists with your ID.' };
            // }

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Problem processing Profile submission.' }
        }
    }

    async addNewAutoEnroller({ set, body}:any){
        const { names, email, phone, roles, supportLevel } = body;
        try {
            const user: AutoEnrol = await db.autoEnrol.create({ 
                data: {
                    names, email, phone, roles, supportLevel
                }
            });

            if(!user){
                set.status = 404;
                return { message:'Unable to create data table' }
            }
            
            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: user, message:`Successfully created an Auto-User` }
        } catch (error:any) {
            console.error(error);

            if(error.code === "P2002"){
                set.status = HttpStatusEnum.HTTP_409_CONFLICT;
                return { message: 'A similar entry already exists' }
            }
            
            set.status = 500;
            return { message: 'Could not create Auto-User' }
        }
    }

    /* PUT */

    // Updates a User profile
    async updateUserProfile({ set, params, user:{ id, roles }, body }:any) {
        try {

            let imageId: {etag:string; versionId:string|null}|null = null;

            if(body.photo){
                try {
                    // imageId = await usersService.uploadPhoto(body.photo)
                } catch(err) {
                    console.error(err);
                }
            }


            const profile = await db.profile.update({

                where: { userId: !!params?.userId ? params?.userId : id },
                data: {
                    bio: body.bio,
                    isActive: body.isActive ?? undefined,
                }
            });

            if(!profile){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Profile not found' }
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: profile, message: `Successfully updated User Profile. ${imageId ? '' : '(Without photo)'}` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: `Could not modify User Profile.` }
        }
    }

    // Deactivates/Activates a User account [ADMIN]
    async deactivateUser ({ set, params:{ userId }, user:{ id }, body: { isActive } }:any):Promise<{user: User, message: string}|{message: string}> {
        try {
            const user = await db.user.update({ where: { id: id }, data: { isActive: isActive} });

            if(!user){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: `Could not find User.` }
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { user: user, message: `User successfully ${isActive ? 'activated' : 'deactivated'}` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: `Could not ${isActive ? 'activate' : 'deactivate'} account.` }
        }
    }
}

const usersService = new UsersService();
const authService = new AuthService();
export default new UsersController(usersService, authService) // .start();
