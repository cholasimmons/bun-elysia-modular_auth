import { UsersService } from "~modules/users";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { db } from "~config/prisma";
import { AutoEnrol, Profile, User } from "@prisma/client";
import { AuthService } from "..";
import { lucia } from "~config/lucia";
import { formatDate } from "~utils/utilities";


export class UsersController {
    constructor(private usersService: UsersService, private authService: AuthService) {}

    /* GET */

    // STAFF: Get ALL Users, or only active ones via query ?isActive=true/false
    async getAllUsers({ set, query: { isActive, profiles }, log }:any):Promise<{data: Partial<User>[], message: string}|{message: string}> {
        log.error("isActive: ", isActive);
        log.info("Status: ", set.status);
        try {
            const users = await this.usersService.getAll(isActive, profiles);

            // if(!users){
            //     set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            //     return { message: 'Could not fetch Users' }
            // }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: users, message: `Retrieved ${users.length > 1 ? users.length : '0'} Users` }
        } catch (err:any) {
            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not fetch Users' }
        }
        
    }

    // Retrieve single User [ADMIN | SELF]
    async getAccountById({ set, user, params:{ userId }, query:{ profile } }:any) {        
        const user_id = userId ?? user.id;        

        try {
            if(!user_id){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No User details found' };
            }

            const u: Partial<User> = await this.usersService.getUser(user_id, {profile})

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: u, message: 'Successfully retrieved User' };
        } catch (err) {
            console.error(err);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not fetch a User' }
        }
    }

    // Retrieve User's Account status [SELF | STAFF]
    async getAccountStatus({ set, user, params:{ userId } }:any) {        
        const user_id = userId ?? user.id;        

        try {
            if(!user_id){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No User ID found' };
            }

            const u: Partial<User> = await this.usersService.getUser(user_id);

            const isActive = u.isActive;

            if(isActive == null || isActive == undefined){
                set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
                return { message: 'Active status unknown' }
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: isActive.toString(), message: 'Successfully retrieved User Account status' };
        } catch (err) {
            console.error(err);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not fetch User\'s Active status' }
        }
    }

    // Retrieve single User Profile [ADMIN]
    async getProfileByUserId({ set, params:{ userId }, query:{ account } }: any):Promise<{data: Profile, message:string}|{message:string}> {
        try {
            const profile = await db.profile.findUnique({
                where: {
                    userId: userId
                },
                include: {
                    user: account ? {
                        select: {
                            id: true,
                            firstname: true,
                            lastname: true,
                            roles: true,
                            email: true,
                            emailVerified: true,
                            phone: true,
                            isActive: true,
                            isComment: true,
                            createdAt: true
                        }
                    } : false
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
    async getMyProfile({ set, user, query:{ account } }: any){
        try {
            const profile = await db.profile.findUnique({
                where: { userId: user.id },
                include: {
                    user: account ? {
                        select: {
                            id: true,
                            firstname: true,
                            lastname: true,
                            roles: true,
                            email: true,
                            emailVerified: true,
                            phone: true,
                            isActive: true,
                            isComment: true,
                            createdAt: true
                        }
                    } : false
                }
            });

            if(!profile){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Profile does not exist'};
            }

            if(!profile.isActive){
                set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
                return { data: profile.isComment, message: 'Profile is deactivated' };
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
    async getAllProfiles({ set, query:{ account } }: any):Promise<{data: Profile[], message:string}|{message:string}>{
        try {
            const profiles = await db.profile.findMany({
                include: {
                    user: account ? {
                        select: {
                            id: true,
                            firstname: true,
                            lastname: true,
                            roles: true,
                            email: true,
                            emailVerified: true,
                            phone: true,
                            isActive: true,
                            isComment: true,
                            createdAt: true
                        }
                    } : false
                }
            });

            if(!profiles){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Error retrieving User Profiles' };
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: profiles, message: `Retrieved ${profiles.length > 1 ? profiles.length : '0'} User Profiles` };
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
                return { message:'Could not retrieve auto-enrollers' }
            }

            set.status = 200;
            return { data: autos, message: `Retrieved ${autos.length ?? 0} Auto-enrollers` }
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message:'An internal error occurred with auto-enrollment' }
        }
    }


    /* POST */  


    // Create a User Profile, must have a verified email address
    async createNewProfile({ set, body, user, session, user:{ id, firstname, lastname, email, phone, emailVerified, profileId }, request:{ headers }, cookie:{ lucia_auth }, authJWT }:any) {
        console.debug("User..: ", user);
        console.debug("Session..: ", session);

        try {
            // Checking if ProfileID exists in session/token
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
                    // uploadedImage = await this.usersService.uploadPhoto(body.photo) 
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

            // Disabled, to keep auto-users list forever
            // if(autoUser?.supportLevel && autoUser?.supportLevel > 0){
            //     await db.autoEnrol.update({ where: { email: email}, data: { isActive: false, isComment: `Used for Profile Registration at ${new Date()}` } });
            // }

            const newProfile: any = await this.usersService.createUserProfile(ammendedProfile)
            
            if(!newProfile){
                set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
                return { message: 'Problem processing profile submission.' }
            }

            // Generate access token (JWT) using new profile details
            const accessToken = await authJWT.sign({
                id: newProfile.userId,
                firstname: newProfile.firstname,
                lastname: newProfile.lastname,
                roles: newProfile.user?.roles,
                emailVerified: newProfile.user?.emailVerified,
                createdAt: newProfile.user?.createdAt,
                profileId: newProfile.id ?? null
            });

            const sess = await this.authService.createLuciaSession(user.id, headers, newProfile.id);
            const sessionCookie = lucia.createSessionCookie(sess.id);
            await lucia.invalidateSession(lucia_auth.value);
            
            set.status = HttpStatusEnum.HTTP_201_CREATED;
            set.headers["Set-Cookie"] = sessionCookie.serialize();
            set.headers["Authentication"] = `Bearer ${accessToken}`;
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

    // Add new Auto-User to list [ADMIN]
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
    async updateUserProfile({ set, params:{ userId }, user:{ id }, body }:any) {
        try {

            let imageId: {etag:string; versionId:string|null}|null = null;

            if(body.photo){
                try {
                    // File service
                    // imageId = await this.usersService.uploadPhoto(body.photo)
                } catch(err) {
                    console.error(err);
                }
            }


            const profile = await db.profile.update({
                where: { userId: userId ?? id },
                data: {
                    bio: body.bio,
                    // photoId: imageId?.etag ?? null,
                    firstname: body.firstname,
                    lastname: body.lastname,
                    gender: userId ? body.gender : undefined,
                    supportLevel: userId ? body.supportLevel : undefined,
                    phone: body.phone,
                    isActive: userId ? body.isActive : undefined,
                    isComment: userId ? body.isComment : undefined
                }
            });

            if(!profile){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Could not update Profile' }
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: profile, message: `Successfully updated User Profile. ${imageId ? '' : '(Without photo)'}` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: `Could not modify User Profile.` }
        }
    }

    // Deactivates a User account [ADMIN]
    async deactivateUser ({ user, set, params:{ userId }, body: { isComment } }:any):Promise<{data: Partial<User>, message: string}|{message: string}> {
        const user_id = userId ?? user.id
        const now = new Date();
        const theComment = isComment ?? `Deactivated on ${formatDate(now)}`;

        try {
            const user = await db.user.update({
                where: { id: user_id },
                data: { isActive: false, isComment: theComment },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    roles: true,
                    email: true,
                    emailVerified: true,
                    phone: true,
                    profile: false,
                    profileId: true,
                    isActive: true,
                    isComment: true,
                    createdAt: true
                }
            });

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: user, message: `User successfully deactivated` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: `Could not deactivate user account.` }
        }
    }
}