import { HttpStatusEnum } from "elysia-http-status-code/status";
import { db, prismaSearch } from "~config/prisma";
import { AutoEnrol, FileStatus, Profile, Role, User } from "@prisma/client";
import { FilesService, UsersService } from "../";
import { formatDate, usernameFromEmail } from "~utils/utilities";
import { BucketType, IImageUpload } from "~modules/files/files.model";
import { redisGet, redisMessagingService, redisSet } from "~config/redis";
import { ProfileWithPartialUser, ProfileWithSafeUserModel, SafeUser } from "./users.model";
import { S3Error } from "minio";
import { AuthorizationError, ConflictError, InternalServerError, NotFoundError } from "~exceptions/custom_errors";


export class UsersController {
    // private authService = AuthService.instance;

    constructor(private fileService: FilesService, private userSvc: UsersService) {
        // this.fileService = new FilesService();
        // this.authService = AuthService.instance;
        // this.userSvc = UsersService.instance;
        console.info(":: UsersController is GO");
    }

    /* GET */

    // STAFF: Get ALL Users, or only active ones via query ?isActive=true/false
    getAllUsers = async({ set, query }:any) => {
        const { isActive, profile } = query;
        const { page, limit, sortBy, sortOrder, searchField, search } = query;
        const searchOptions = {
            page, limit,
            sortBy: { field: sortBy ?? 'createdAt', order: sortOrder },
            search: { field: searchField ?? 'lastname', value: search},
            include: { profile, isActive }
        }

        try {
            const users = await prismaSearch('user', searchOptions);
            // const users = await this.userService.getAll(isActive, profiles);

            if(!users){
                set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
                return { message: 'Could not fetch Users' }
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { total: users.total, count: users.count, page: users.page, data: users.data, message: `Found ${users.data.length > 1 ? users.data.length : '0'} Users` }
        } catch (err:any) {
            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            // return { message: 'Could not fetch Users' }
            throw err;
        }
        
    }

    // Retrieve single User [ADMIN | SELF]
    getAccountById = async({ set, user, params, query }:any) => {
        const user_id = params?.userId ?? user.id ?? null;
        const { profile } = query;

        try {
            if(!user_id){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'No User details found' };
            }

            const u: Partial<User> = await this.userSvc.getUser(user_id, {profile});

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: u, message: 'Successfully retrieved User' };
        } catch (err) {
            console.error(err);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not fetch a User', note: err }
        }
    }

    // Retrieve User's Account status [SELF | STAFF]
    getAccountStatus = async({ set, user, params }:any) => {        
        const user_id = params?.userId ?? user?.id;        

        try {
            if(!user_id){
                throw new NotFoundError("No User ID found", 404, "No User ID was provided");
                // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                // return { message: 'No User ID found' };
            }

            const u: Partial<User> = await this.userSvc.getUser(user_id);

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

    // Retrieve User's Profile status [SELF | STAFF]
    getProfileStatus = async({ set, user, params }:any) => {        
        const user_id = params?.userId ?? user?.id;

        try {
            if(!user_id){
                throw new NotFoundError("No User ID provided");
                // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                // return { message: 'No User ID found' };
            }

            const partialProfile: Partial<Profile> = await this.userSvc.getProfileByUserId(user_id);

            const isActive = partialProfile.isActive;

            if(isActive == null || isActive == undefined){
                throw new InternalServerError("Active status unknown");
                // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
                // return { message: 'Active status unknown' }
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: isActive.toString(), message: 'Retrieved User Profile status' };
        } catch (err) {
            console.error(err);

            throw err;

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not fetch User\'s Active status' }
        }
    }

    // Retrieve single User Profile [ STAFF | ADMIN | SELF]
    getProfileByUserId = async ({ set, user, params, query }: any) => {
        const user_id = params?.userId;
        const { account, subscription, usedCoupons } = query;

        try {
            const profile = await this.userSvc.getProfileByUserId(user_id, { account, subscription, usedCoupons })

            // if(!profile){
            //     throw new NotFoundError("Error fetching Profile");
            //     // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
            //     // return { message: '' };
            // }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: profile, message: `Successfully retrieved User Profile${account ? ' and Account' : '.'}` };
        } catch(e:any) {
            console.warn(e);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not fetch Profile of that ID', note: String(e.message) }
        }
    }

    // Retrieve currently logged in User's Profile [SELF]
    getMyProfile = async({ set, user, params, query }: any) => {
        const user_id = user?.id;
        const { account, subscription, usedCoupons } = query;

        try {
            const profile: ProfileWithPartialUser = await this.userSvc.getProfileByUserId(user_id, { account, subscription, usedCoupons })

            // if(!profile){
            //     throw new NotFoundError("Profile does not exist");
            //     // set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
            //     // return { message: 'Profile does not exist'};
            // }

            if(!profile.isActive){
                throw new AuthorizationError(`Your profile is deactivated. ${profile.isComment ?? ''}`);
                // set.status = HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE;
                // return { data: profile.isComment, message: 'Profile is deactivated' };
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: profile, message: 'Successfully retrieved your User Profile' };
        } catch(e) {
            // console.warn(e);

            throw e;
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
    createNewProfile = async({ set, body, user:{ id, firstname, lastname, email, phone, profileId }, request:{ headers }, jwt, authMethod }:any) => {

        try {
            // Checking if ProfileID exists in session/token
            if(profileId){
                // Checking if User already has a Profile 
                const profile = await db.profile.findUnique({ where: {id:profileId}, select: {id:true} })

                if(profile){
                    throw new ConflictError("You already have a profile.");
                    // set.status = HttpStatusEnum.HTTP_409_CONFLICT;
                    // return { message: `You already have a profile.` }
                }
            }


            // console.log('Checking for pre-existing Profile of similar credentials...');
            // Check DB for profile of same nrc/passport number
            const conflictingProfile: Partial<Profile>|null = await db.profile.findFirst({
                where: {
                    documentId: body.documentId,
                    documentType: body.documentIdType
                },
                select:{
                    documentId: true,
                    documentType: true,
                    firstname: true,
                    lastname: true
                }
            });

            // Store what values conflict so we can inform User
            let conflict: string = '';
            if(conflictingProfile && conflictingProfile?.documentId === body.documentId){
                conflict = conflictingProfile?.documentId!

                set.status = HttpStatusEnum.HTTP_302_FOUND;
                return { message: `That ${conflictingProfile.documentType!.toWellFormed()} number is already used`, note: `Similar ${conflictingProfile.documentType!.toWellFormed()} exists in the system` };
            }

            // let uploadedImage: {etag:string; versionId:string|null}|null = null;
            let uploadedImage: IImageUpload|null = null;
            let uploadError: string|null = null;

            // If User uploaded a photo, persist it to File Server and add it's ID to profile
            if(body.photo){
                try{
                    uploadedImage = await this.fileService.uploadPhoto(body.photo, BucketType.USERS, id, usernameFromEmail(email), false)
                } catch(err:any) {
                    uploadError = err.toString();
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
                email: email,
                phone: phone ?? body.phone,
                supportLevel: autoUser?.supportLevel ?? 0,
                userId: id,
                photo: uploadedImage?.name ?? null
            }

            // Disabled, to keep auto-users list forever
            // if(autoUser?.supportLevel && autoUser?.supportLevel > 0){
            //     await db.autoEnrol.update({ where: { email: email}, data: { isActive: false, isComment: `Used for Profile Registration at ${new Date()}` } });
            // }

            // Create a new User Profile
            const newProfile: ProfileWithSafeUserModel = await this.userSvc.createUserProfile(ammendedProfile)


            if(!newProfile){
                // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
                // return { message: 'Problem processing profile submission.' }
                throw new InternalServerError("Error processing profile submission.");
            }

            // TODO: Ideally have the profile created as inactive, until approven by a case officer
            // Payment could be an option or simply a document verification

            redisMessagingService.publish('user-events', {
                action: "user:profile-created",
                user: newProfile
            });

            
            // Generate access token using new profile details
            // const tokenOrCookie = await this.authService.createDynamicSession(authMethod, jwt, newProfile.user!, headers, undefined);
            // if(authMethod === 'JWT'){
            //     set.headers["Authorization"] = `Bearer ${tokenOrCookie}`;
            // } else if (authMethod === 'Cookie'){
            //     set.headers["Set-Cookie"] = tokenOrCookie.serialize();
            // }
            
            set.status = HttpStatusEnum.HTTP_201_CREATED;
            return { data: newProfile, message: `User Profile successfully created. ${!!uploadedImage ? '' : '(No image)'}` }
        } catch(err:any){
            console.warn(`errrr ${err}`);

            // if(err instanceof SharpImageError){
            //     console.warn("Sharp ",err);
                
            //     set.status = err.errorCode;
            //     return { message: err.message }
            // }

            if(err instanceof S3Error){                
                set.status = HttpStatusEnum.HTTP_503_SERVICE_UNAVAILABLE;
                return { message: err.message, note: err.code ?? err.name }
            }

            throw err;

            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            // return { message: 'Problem processing Profile submission', note:err }
        }
    }

    // Add new Auto-User to list [ADMIN]
    addNewAutoEnroller = async ({ set, body}:any) => {
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

    /* PATCH */

    updateSubscription = async({ set, user }:any) => {
        // userId:string, subscription:SubscriptionType
    }

    // Updates a User profile
    updateUserProfile = async({ set, params, user, body }:any) => {
        const user_id = params?.userId ?? user?.id ?? null;
        const data: Profile = {...body};

        try {

            let uploadedImage: IImageUpload|any = null;

            if(body?.photo){
                try {
                    // File service
                    await db.$transaction(async (tx) =>{
                        const tempImage = await this.fileService.uploadPhoto(body.photo, BucketType.USERS, user?.profileId, user?.id, false, false);
        
                        if(!uploadedImage){
                            console.error('Unable to upload image');
                            return { note: 'Could not upload User image'}
                        }

                        uploadedImage = tempImage; // Assign only after successful upload

                        await tx.fileUpload.create({
                            data:{
                                origName: body.photo.name,
                                fileName: uploadedImage.name,
                                fileType: uploadedImage.type,
                                fileSize: uploadedImage.size,
                                key: uploadedImage.name,
                                bucket: BucketType.USERS,
                                path: `/${BucketType.USERS.toLowerCase()}/${uploadedImage.name}`,
                                uploaderUserId: user.id,
                                status: FileStatus.UPLOADED,
                                isPublic: Boolean(true)
                            }
                        })
                    })
                } catch(err) {
                    console.error(err);
                }
            }

            const profile = await db.profile.update({
                where: { userId: user_id },
                data: {
                    bio: data.bio,
                    photo: uploadedImage?.name ?? null,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    gender: user_id ? data.gender : undefined,
                    documentId: params?.userId ? data.documentId : undefined,
                    documentType: params?.userId ? data.documentType : undefined,
                    supportLevel: params?.userId ? data.supportLevel : undefined,
                    phone: data.phone,
                    isActive: params?.userId ? data.isActive : undefined,
                    isComment: params?.userId ? data.isComment : undefined
                }
            });

            if(!profile){
                set.status = HttpStatusEnum.HTTP_404_NOT_FOUND;
                return { message: 'Could not update Profile' }
            }

            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: profile, message: `Successfully updated User Profile${uploadedImage?.name ? '.' : ' (Without photo)'}` };
        } catch (error) {
            console.error(error);

            set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            return { message: 'Could not modify User Profile', note: error }
        }
    }

    // Updates a User's roles [STAFF]
    addUserRoles = async({ set, params, body }:any) => {
        const user_id = params.userId;
        const newRoles: Role[] = body.newRoles;
        const oldRoles: Role[] = body.oldRoles;

        try {
            let user: User|null = await redisGet(`user:${user_id}`);

            if(!user){
                user = await db.user.findUnique({
                    where: { id: user_id}
                });

                if(!user){
                    throw new NotFoundError("No User with that ID");
                }

                await redisSet(`user:${user_id}`, user, 5)
            }

            const roles = this.userSvc.modifyRoles.add(user.roles, newRoles, oldRoles)

            const dbUser: User|null = await db.user.update({
                where: { id: user_id },
                data: { roles: roles }
            });

            const cleanUser: SafeUser = this.userSvc.sanitizeUserObject(dbUser);


            set.status = HttpStatusEnum.HTTP_200_OK;
            return { data: cleanUser, message: `Updated User Roles ${cleanUser.roles}` };
        } catch (error) {
            // console.error(error);

            throw error;

            // set.status = HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR;
            // return { message: 'Could not modify User Profile', note: error }
        }
    }

    // Deactivates a User account [ADMIN]
    deactivateUser = async({ user, set, params, body: { isComment } }:any):Promise<{data: Partial<User>, message: string}|{message: string}> => {
        const user_id = params?.userId ?? user.id ?? null;
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
                    username: true,
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