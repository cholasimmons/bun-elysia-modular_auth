import { Prisma, Profile, Role, SubscriptionType, User  } from "@prisma/client";
import { db } from "~config/prisma";
import { Resend } from "resend";
import consts from "~config/consts";
import { redisGet, redisSet } from "~config/redis";
import { PartialUserWithProfile, PrismaUserWithOptionalProfile, PrismaUserWithProfile, ProfileWithPartialUser, ProfileWithSafeUser, ProfileWithSafeUserModel } from "./users.model";
import { InternalServerError, NotFoundError } from "src/_exceptions/custom_errors";



export class UsersService {
    private resend = new Resend(Bun.env.RESEND_API_KEY);

    async getAll(isActive?: boolean, profiles?: boolean){
        try {
            let allUsers = await redisGet<Partial<User>[]>(`users`);

            if(allUsers){
                return allUsers;
            }
            
            const users = await db.user.findMany({
                where: { isActive: isActive ?? undefined },
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    roles: true,
                    email: true,
                    emailVerified: true,
                    profile: profiles ?? false,
                    profileId: true,
                    phone: true,
                    isActive: true,
                    isComment: true,
                    createdAt: true
                }
            });

            await redisSet('users', users);

            return users;
            
        } catch (error) {
            console.error("Could not get all users. ",error);
            throw `Unable to retrieve ${isActive ? 'active' : 'deactivated'} Users`;
        }
        
    }

    // Returns a unique User from the DB with particular ID string
    async getUser(userId: string, opts?:{ profile?:boolean, isActive?:boolean }): Promise<PrismaUserWithOptionalProfile> {
        try {
            let user: PrismaUserWithOptionalProfile|null = await redisGet<PrismaUserWithOptionalProfile|null>(`user:${userId}`);

            if(!user){
                user = await db.user.findUnique({
                    where: { id: userId, isActive: opts?.isActive },
                    include: {
                        profile: opts?.profile ?? false,
                        authSession: false,
                    }
                });

                if(!user) throw new NotFoundError('Could not find user with that ID');

                let cleanUser: PrismaUserWithOptionalProfile|any = { ...user}
                delete cleanUser.hashedPassword;

                await redisSet(`user:${userId}`, cleanUser);
            }

            return user;
        } catch (error) {
            console.error(error);
            throw error
        }
    }

    async createUserProfile(data: any): Promise<ProfileWithSafeUserModel> {
        const { firstname, lastname, documentId, documentType, gender, bio, email, phone,
            supportLevel, userId, photo } = data;
        try {
            // console.log("Received User Profile data: ",data);

            // 1. Create the Profile
            const newProfile: Profile|null = await db.profile.create({
                data: {
                    firstname, lastname,
                    documentId, documentType,
                    gender, bio,
                    email, phone,
                    supportLevel,
                    photo,
                    subscriptionType: SubscriptionType.FREE
                },
            });

            // 2. Update the User with profileId
            const userWithProfile: PrismaUserWithProfile|null = await db.user.update({
                where: { id: userId },
                data: { profileId: newProfile.id },
                include: { profile: true }
            });
            
            // let freshUser:PrismaUserWithProfile|null = await db.user.update({
            //     where:{
            //         id: userId
            //     },
            //     data:{
            //         firstname: firstname,
            //         lastname: lastname,
            //         phone: phone,
            //         profile: {
            //             create: {
            //                 firstname, lastname,
            //                 documentId, documentType,
            //                 gender, bio,
            //                 email, phone,
            //                 supportLevel,
            //                 photo,
            //                 subscriptionType: SubscriptionType.FREE,
            //             }
            //         }
            //     },
            //     include: { profile: true }
            // })

            if(!userWithProfile.profile){
                throw new InternalServerError('Could not update User with new User Profile')
            }

            // return Profile with user object WITHOUT sensitive data
            const returnSafeUserProfile: ProfileWithSafeUserModel|any = {
                ...userWithProfile.profile,
                // gender: String(freshUser.profile?.gender),
                user: {
                    id: userWithProfile.id!,
                    firstname: userWithProfile.firstname,
                    lastname: userWithProfile.lastname,
                    username: userWithProfile.username,
                    phone: userWithProfile.phone ?? null,
                    roles: userWithProfile.roles,
                    email: userWithProfile.email,
                    emailVerified: userWithProfile.emailVerified,
                    createdAt: userWithProfile.createdAt,
                    updatedAt: userWithProfile.updatedAt,
                    profileId: userWithProfile.profileId ?? null,
                    isActive: userWithProfile.isActive,
                    isComment: userWithProfile.isComment
                } 
            }

            await redisSet(`profile:user:${userWithProfile.id}`, returnSafeUserProfile, 3)

            return returnSafeUserProfile as ProfileWithSafeUserModel;
        } catch(e) {
            console.error("Could not persist new profile");
            throw e
        }
    }

    
    // async updateUserRole(userId: string, opts?: { role?: string}){
    //     try {
    //         const user = await auth.updateUserAttributes(
    //             userId,
    //             {
    //                 roles: [...opts?.role ?? []]
    //             } // expects partial `Lucia.DatabaseUserAttributes`
    //         );
    //         return user;
    //     } catch (e) {
    //         if (e instanceof LuciaError && e.message === `AUTH_INVALID_USER_ID`) {
    //             // invalid user id
    //             return 'That User does not exist'
    //         }
    //         // provided user attributes violates database rules (e.g. unique constraint)
    //         // or unexpected database errors

    //     }
    // }

    modifyRoles = {
         add(roles:Role[], newRole: Role, replaceRole: Role): Role[] {

            const replaceIndex = roles.indexOf(replaceRole);

            if (replaceIndex !== -1) {
                // If the new role already exists, replace it
                roles[replaceIndex] = newRole;
            } else {
                // If the new role doesn't exist, append it
                roles.push(newRole);
            }
        
            return roles;
        },
        
        remove(roles:Role[], removeRole: Role): Role[] {

            const removeIndex = roles.indexOf(removeRole);

            if (removeIndex !== -1) {
                // If the role already exists, remove it
                roles.splice(removeIndex, 1);
            }
        
            return roles;
        }
    }


    // Clean full User object, removing sessions, password, OAuth IDs and profile
    async sanitizeUserObject(user: User, opts?:{id?:boolean, verified?:boolean, active?:boolean, comment?:boolean}){
        let tempUser:any = user;

        delete tempUser.hashedPassword;

        const cleanUser: Partial<User> = {
            id: opts?.id ? tempUser.id : undefined,
            firstname: tempUser.firstname,
            lastname: tempUser.lastname,
            username: tempUser.username,
            roles: tempUser.roles,
            email: tempUser.email,
            emailVerified: opts?.verified ? tempUser.emailVerified : undefined,
            phone: tempUser.phone,
            profileId: tempUser.profileId,
            isActive: opts?.active ? tempUser.isActive : undefined,
            isComment: opts?.comment ? tempUser.isComment : undefined,
            createdAt: tempUser.createdAt,
            updatedAt: tempUser.updatedAt,
        };

        return cleanUser;
    }


    async getProfileByUserId(userId:string, query?:{ account?:boolean, subscription?: boolean, usedCoupons?:boolean }){
        try {
            let cachedProfile: ProfileWithPartialUser|null = await redisGet<ProfileWithPartialUser>(`profile:user:${userId}`);

            // dynamic setting to retrieve user object
            const includeUser = query?.account
            ? {
                select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    username: true,
                    roles: true,
                    email: true,
                    emailVerified: true,
                    phone: true,
                    isActive: true,
                    isComment: true,
                    createdAt: true,
                    updatedAt: true
                }
            } : false 
            

            if(!cachedProfile){
                cachedProfile = await db.profile.findUnique({ where: { userId: userId },
                    include: {
                        user: includeUser,
                        subscription: query?.subscription ?? false,
                        usedCoupons: query?.usedCoupons ?? false
                    }
                });

                if(!cachedProfile) throw new NotFoundError(`Profile for User: ${userId} unavailable.`);

                await redisSet(`profile:user:${userId}`, cachedProfile, 1)
            }            

            return cachedProfile;
        } catch (error) {
            throw error
        }
    }

    // async uploadPhoto(photo: File): Promise<{etag:string; versionId:string|null}|null> {
    //     try{
    //         const bucketCheck = await filesService.pingUserImageBucket();
    //         if(bucketCheck === false || !bucketCheck) {
    //             console.warn('Image storage service is unavailable');
    //             return null;
    //         };

    //         return await filesService.uploadUserPhoto(photo);
    //     } catch(err) {
    //         // console.error(err);
    //         // return null
    //         throw err
    //     }
    // }

    async sendEmailToUser(userProfile:Partial<Profile>, message:string, subject?:string){
        console.log(`Sending message to ${userProfile.firstname}`);
        // TODO: Implement timeout to limit the resends

        try {
            await this.resend.emails.send({
                from: consts.server.email, // 'onboarding@resend.dev',
                to: userProfile?.email!,
                subject: subject ?? `System message | ${consts.server.name}`,
                html: message,
            });
        } catch (error) {
            console.error(error);
            
            throw 'Could not send email.'
        }
    }
}